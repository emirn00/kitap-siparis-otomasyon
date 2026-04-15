import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// ── API types ────────────────────────────────────────────────────────────────

interface ApiOrderResponse {
  id: string;
  userName: string;
  email?: string;
  books: { id: string; title?: string; requestName?: string }[];
  status: string;
}

// ── Internal models ───────────────────────────────────────────────────────────

export interface PendingOrder {
  id: string;
  fullName: string;
  email: string;
  bookNames: string[];
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  selected: boolean;
}

export interface LicenseEntry {
  bookNameRaw: string;
  bookNameNorm: string;
  code: string;
  used: boolean;
}

export interface MatchedBook {
  name: string;
  code: string | null;
}

export interface MailRow {
  orderId: string;
  fullName: string;
  email: string;
  books: MatchedBook[];
  allMatched: boolean;
  include: boolean;
}

@Component({
  selector: 'app-admin-send-mail',
  templateUrl: './admin-send-mail.component.html',
  styleUrls: ['./admin-send-mail.component.scss']
})
export class AdminSendMailComponent implements OnInit {

  private readonly ordersUrl = 'http://localhost:8080/orders';

  // ── Step 1: Orders ────────────────────────────────────────────────────────

  allOrders: PendingOrder[] = [];
  ordersStatusFilter: 'PENDING' | 'COMPLETED' | 'ALL' = 'PENDING';
  ordersLoading = false;
  ordersError: string | null = null;

  get orders(): PendingOrder[] {
    if (this.ordersStatusFilter === 'ALL') return this.allOrders;
    return this.allOrders.filter(o => o.status === this.ordersStatusFilter);
  }

  get pendingCount(): number  { return this.allOrders.filter(o => o.status === 'PENDING').length; }
  get completedCount(): number { return this.allOrders.filter(o => o.status === 'COMPLETED').length; }

  // ── Step 2: CSV ───────────────────────────────────────────────────────────

  csvFileName: string | null = null;
  csvHeaders: string[] = [];
  csvDataRows: string[][] = [];
  csvLoading = false;
  csvError: string | null = null;

  csvBookCol = -1;
  csvCodeCol = -1;

  // ── Step 3: Preview ───────────────────────────────────────────────────────

  mailRows: MailRow[] = [];
  matchDone = false;

  // ── Send ──────────────────────────────────────────────────────────────────

  showSendModal = false;
  sending = false;
  successMessage: string | null = null;
  sendError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Orders
  // ─────────────────────────────────────────────────────────────────────────

  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;
    this.http.get<ApiOrderResponse[]>(this.ordersUrl).subscribe({
      next: (data) => {
        this.allOrders = data.map(o => ({
          id: o.id,
          fullName: o.userName ?? '',
          email: o.email ?? '',
          bookNames: (o.books ?? []).map(b => b.requestName ?? b.title ?? '').filter(Boolean),
          status: (o.status as PendingOrder['status']) ?? 'PENDING',
          selected: o.status === 'PENDING',
        }));
        this.ordersLoading = false;
        this.matchDone = false;
      },
      error: () => {
        this.ordersError = 'error';
        this.ordersLoading = false;
      }
    });
  }

  setOrdersFilter(f: 'PENDING' | 'COMPLETED' | 'ALL'): void {
    this.ordersStatusFilter = f;
  }

  toggleOrder(order: PendingOrder): void {
    if (order.status !== 'PENDING') return;
    order.selected = !order.selected;
    this.matchDone = false;
  }

  toggleAllOrders(select: boolean): void {
    this.allOrders.filter(o => o.status === 'PENDING').forEach(o => (o.selected = select));
    this.matchDone = false;
  }

  get selectedOrderCount(): number {
    return this.allOrders.filter(o => o.selected && o.status === 'PENDING').length;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — CSV
  // ─────────────────────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.csvError = null;
    this.csvFileName = file.name;
    this.csvHeaders = [];
    this.csvDataRows = [];
    this.csvLoading = true;
    this.matchDone = false;

    const reader = new FileReader();
    reader.onload = () => {
      this.csvLoading = false;
      const buffer = reader.result as ArrayBuffer;
      const text = this.decodeCsvBuffer(buffer);
      if (!text?.trim()) { this.csvError = 'empty'; return; }
      this.parseCsv(text);
      this.autoDetectColumns();
    };
    reader.onerror = () => { this.csvLoading = false; this.csvError = 'read'; };
    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  private decodeCsvBuffer(buffer: ArrayBuffer): string {
    let text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    if (text.includes('\uFFFD')) {
      try { text = new TextDecoder('windows-1252').decode(buffer); }
      catch { text = new TextDecoder('iso-8859-1').decode(buffer); }
    }
    return text;
  }

  private parseCsv(text: string): void {
    const rawLines = text.split(/\r?\n/);
    const logicalLines: string[] = [];
    let current = '';
    for (const line of rawLines) {
      current += (current ? '\n' : '') + line;
      if ((current.match(/"/g) || []).length % 2 === 0) {
        if (current.trim()) logicalLines.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) logicalLines.push(current.trim());

    const rows = logicalLines
      .filter(l => l.length > 0)
      .map(l => this.parseCsvLine(l).map(c => c.replace(/\r?\n/g, ' ').trim()));

    if (rows.length === 0) { this.csvError = 'empty'; return; }

    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => { const c = [...r]; while (c.length < maxCols) c.push(''); return c; });

    this.csvHeaders = normalized[0] ?? [];
    this.csvDataRows = normalized.slice(1);
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const c of line) {
      if (c === '"') { inQuotes = !inQuotes; }
      else if (!inQuotes && c === ';') { result.push(current.trim()); current = ''; }
      else { current += c; }
    }
    result.push(current.trim());
    return result;
  }

  private autoDetectColumns(): void {
    const bookKw = ['bezeichnung', 'titel', 'title', 'book', 'kitap', 'produkt', 'name'];
    const codeKw = ['lizenzcode', 'code', 'key', 'aktivierungscode', 'kod', 'lizenz'];
    this.csvBookCol = -1;
    this.csvCodeCol = -1;
    this.csvHeaders.forEach((h, i) => {
      const l = h.toLowerCase();
      if (this.csvBookCol === -1 && bookKw.some(k => l.includes(k))) this.csvBookCol = i;
      if (this.csvCodeCol === -1 && codeKw.some(k => l.includes(k))) this.csvCodeCol = i;
    });
  }

  get csvReady(): boolean {
    return this.csvDataRows.length > 0 && this.csvBookCol >= 0 && this.csvCodeCol >= 0;
  }

  get licensePool(): Map<string, string[]> {
    const pool = new Map<string, string[]>();
    for (const row of this.csvDataRows) {
      const name = (row[this.csvBookCol] ?? '').trim();
      const code = (row[this.csvCodeCol] ?? '').trim();
      if (!name || !code) continue;
      const key = this.norm(name);
      if (!pool.has(key)) pool.set(key, []);
      pool.get(key)!.push(code);
    }
    return pool;
  }

  get csvBookStats(): { name: string; count: number }[] {
    const stats: { name: string; count: number }[] = [];
    const seen = new Map<string, number>();
    for (const row of this.csvDataRows) {
      const name = (row[this.csvBookCol] ?? '').trim();
      if (!name) continue;
      const key = this.norm(name);
      seen.set(key, (seen.get(key) ?? 0) + 1);
      if (!stats.find(s => this.norm(s.name) === key)) stats.push({ name, count: 0 });
    }
    return stats.map(s => ({ name: s.name, count: seen.get(this.norm(s.name)) ?? 0 }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 — Match
  // ─────────────────────────────────────────────────────────────────────────

  runMatch(): void {
    if (!this.csvReady || this.selectedOrderCount === 0) return;

    // Build a mutable pool (copy of codes)
    const pool = new Map<string, string[]>();
    for (const [key, codes] of this.licensePool.entries()) {
      pool.set(key, [...codes]);
    }

    this.mailRows = this.allOrders
      .filter(o => o.selected && o.status === 'PENDING')
      .map(order => {
        const books: MatchedBook[] = order.bookNames.map(name => {
          const key = this.norm(name);
          // Try exact match first, then partial
          let codes = pool.get(key);
          if (!codes || codes.length === 0) {
            // Fuzzy: find a pool key that contains or is contained in the query
            for (const [k, v] of pool.entries()) {
              if (v.length > 0 && (k.includes(key) || key.includes(k))) {
                codes = v;
                break;
              }
            }
          }
          if (codes && codes.length > 0) {
            const code = codes.shift()!; // consume first available
            return { name, code };
          }
          return { name, code: null };
        });

        const allMatched = books.every(b => b.code !== null);
        return { orderId: order.id, fullName: order.fullName, email: order.email, books, allMatched, include: true };
      });

    this.matchDone = true;
  }

  get matchedCount(): number { return this.mailRows.filter(r => r.allMatched).length; }
  get unmatchedCount(): number { return this.mailRows.filter(r => !r.allMatched).length; }
  get includedCount(): number { return this.mailRows.filter(r => r.include).length; }
  get totalIncludedCodes(): number {
    return this.mailRows.filter(r => r.include).reduce((sum, r) => sum + r.books.filter(b => b.code).length, 0);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Send
  // ─────────────────────────────────────────────────────────────────────────

  openSendModal(): void {
    this.showSendModal = true;
    this.sendError = null;
  }

  closeSendModal(): void {
    this.showSendModal = false;
  }

  confirmSend(): void {
    this.sending = true;
    this.sendError = null;
    // TODO: Backend API
    setTimeout(() => {
      this.sending = false;
      this.showSendModal = false;
      const count = this.mailRows.filter(r => r.include).length;
      this.successMessage = `${count} hocaya mail başarıyla gönderildi.`;
      setTimeout(() => (this.successMessage = null), 6000);
    }, 1800);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utils
  // ─────────────────────────────────────────────────────────────────────────

  private norm(s: string): string {
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}
