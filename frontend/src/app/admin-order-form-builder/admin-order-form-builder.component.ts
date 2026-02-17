import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

/** Sabit head (head.csv ile aynı: 7 satır, 5 sütun) */
const HEAD_ROWS: string[][] = [
  ['Bestellung Hueber iV Lizenzen', '', '', '', ''],
  ['Kundennummer:', '955.800', 'Vorname: ', '', ''],
  ['Straße:', '', 'PLZ:', '', ''],
  ['Zahlart (Rechnung oder Vorausrechnung): ', '', 'Email-Adresse Code-Empfänger: ', 'merve@tak.com.tr', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['Anzahl Codes', 'Anzahl Aktivierungen', 'Laufzeit Monate', 'Artikelnummer und Titel', 'Einzelpreis']
];

export interface BookTotalRow {
  /** Artikelnummer und Titel (ISBN + Name) */
  code: string;
  /** Anzahl Codes (Toplam Sipariş Sayısı) */
  quantity: number;
}

interface ApiOrderResponse {
  books: { isbn: string; requestName: string }[];
}

@Component({
  selector: 'app-admin-order-form-builder',
  templateUrl: './admin-order-form-builder.component.html',
  styleUrls: ['./admin-order-form-builder.component.scss']
})
export class AdminOrderFormBuilderComponent {
  bookTotals: BookTotalRow[] = [];
  previewReady = false;
  downloadSuccess: string | null = null;

  startDate: Date | null = null;
  endDate: Date | null = null;
  loading = false;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/api/orders/by-date';

  constructor(private http: HttpClient) {
    // Default: Son 1 hafta (Bugün dahil)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    this.startDate = start;
    this.endDate = end;
  }

  ngOnInit(): void {
    if (this.startDate && this.endDate) {
      this.fetchAndAggregateOrders();
    }
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      this.fetchAndAggregateOrders();
    }
  }

  /** Siparişleri tarih aralığına göre getir ve topla */
  fetchAndAggregateOrders(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.loading = true;
    this.error = null;
    // Preview açık kalsın, sadece veri güncellensin
    if (!this.previewReady) {
      this.previewReady = false;
    }

    // Date -> YYYY-MM-DD string conversion
    const startStr = this.formatDate(this.startDate);
    const endStr = this.formatDate(this.endDate);

    const url = `${this.apiUrl}?startDate=${startStr}&endDate=${endStr}`;

    this.http.get<ApiOrderResponse[]>(url).subscribe({
      next: (orders) => {
        this.aggregateOrders(orders);
        this.loading = false;
        this.previewReady = true;
      },
      error: (err) => {
        console.error('Siparişler getirilemedi', err);
        this.error = 'Siparişler yüklenirken hata oluştu. / Fehler beim Laden der Bestellungen.';
        this.loading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private aggregateOrders(orders: ApiOrderResponse[]): void {
    const countByCode: Record<string, number> = {};

    for (const order of orders) {
      if (!order.books) continue;
      for (const book of order.books) {
        // Kitap tanımlayıcısı: ISBN + Boşluk + Ad. ISBN yoksa sadece Ad.
        const identifier = `${book.isbn || ''} ${book.requestName || ''}`.trim();
        if (identifier) {
          countByCode[identifier] = (countByCode[identifier] || 0) + 1;
        }
      }
    }

    this.bookTotals = Object.entries(countByCode)
      .map(([code, quantity]) => ({ code, quantity }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  closePreview(): void {
    this.previewReady = false;
    this.bookTotals = [];
  }

  /** Excel: head + Formular Bestellung formatında satırlar */
  downloadExcel(): void {
    const rows: (string | number)[][] = HEAD_ROWS.map(row => [...row]);

    for (const row of this.bookTotals) {
      rows.push([
        row.quantity,   // Anzahl Codes (Sipariş edilen toplam sayı)
        '1',            // Anzahl Aktivierungen (Sabit)
        '3 jahre',      // Laufzeit Monate (Sabit)
        row.code,       // Artikelnummer und Titel (ISBN + İsim)
        'kostenlos'     // Einzelpreis (Sabit)
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bestellung');

    const fileName = `Formular_Bestellung_${this.startDate}_${this.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);

    this.downloadSuccess = 'Excel dosyası indirildi. / Excel-Datei heruntergeladen.';
    setTimeout(() => (this.downloadSuccess = null), 4000);
  }

  get headRows(): string[][] {
    return HEAD_ROWS;
  }
}
