import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-lisencode-csv',
  templateUrl: './admin-lisencode-csv.component.html',
  styleUrls: ['./admin-lisencode-csv.component.scss']
})
export class AdminLisencodeCsvComponent {

  fileName: string | null = null;
  rows: string[][] = [];
  error: string | null = null;
  loading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error = null;
    this.rows = [];
    this.fileName = file.name;
    this.loading = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.loading = false;
      const buffer = reader.result as ArrayBuffer;
      if (!buffer?.byteLength) {
        this.error = 'Dosya boş veya okunamadı.';
        return;
      }
      const text = this.decodeCsvBuffer(buffer);
      if (!text?.trim()) {
        this.error = 'Dosya boş veya okunamadı.';
        return;
      }
      this.parseCsv(text);
    };
    reader.onerror = () => {
      this.loading = false;
      this.error = 'Dosya okunamadı.';
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  /** UTF-8 dener; replacement karakter () varsa Windows-1252 (Almanca ä,ö,ü vb.) kullanır */
  private decodeCsvBuffer(buffer: ArrayBuffer): string {
    let text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    if (text.includes('\uFFFD')) {
      try {
        text = new TextDecoder('windows-1252').decode(buffer);
      } catch {
        text = new TextDecoder('iso-8859-1').decode(buffer);
      }
    }
    return text;
  }

  private parseCsv(text: string): void {
    const rawLines = text.split(/\r?\n/);
    const logicalLines: string[] = [];

    // Tırnaklar tamamen kapanana kadar satırları birleştir (Lizenzcode.csv çok satırlı başlık)
    let current = '';
    for (const line of rawLines) {
      current += (current ? '\n' : '') + line;
      const totalQuotes = (current.match(/"/g) || []).length;
      if (totalQuotes % 2 === 0) {
        if (current.trim().length > 0) {
          logicalLines.push(current.trim());
        }
        current = '';
      }
    }
    if (current.trim().length > 0) {
      logicalLines.push(current.trim());
    }

    const lines = logicalLines.filter(l => l.length > 0);
    if (lines.length === 0) {
      this.error = 'CSV içeriği bulunamadı.';
      return;
    }

    const rows: string[][] = [];
    for (const line of lines) {
      const row = this.parseCsvLine(line);
      rows.push(row.map(cell => cell.replace(/\r?\n/g, ' ').trim()));
    }

    const maxCols = Math.max(...rows.map(r => r.length), 1);
    const normalized = rows.map(r => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });
    this.rows = normalized;
  }

  /** Lizenzcode.csv: sadece noktalı virgül (;) sütun ayracı; virgül metin içinde kalır (örn. Bezeichnung) */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (!inQuotes && c === ';') {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  }

  get hasPreview(): boolean {
    return this.rows.length > 0;
  }

  get headerRow(): string[] {
    return this.rows[0] ?? [];
  }

  get dataRows(): string[][] {
    return this.rows.slice(1);
  }

  /** Başlık sütun sayısı (tablo hizası için) */
  get columnCount(): number {
    return this.headerRow.length;
  }
}
