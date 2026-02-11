import { Component } from '@angular/core';
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

/** Mock siparişler: her siparişte seçilen kitap/artikel adları (Formular’daki gibi) */
const MOCK_ORDERS: { books: string[] }[] = [
  { books: ['121051 P Beste Freunde PLUS A1.1 Arbeitsbuch - Interaktive Version', '321082 P Schritte International Neu 1 Kursbuch+Arbeitsbuch'] },
  { books: ['121051 P Beste Freunde PLUS A1.1 Arbeitsbuch - Interaktive Version', '121051 P Beste Freunde PLUS A1.1 Arbeitsbuch - Interaktive Version', '631791 P Momente A1.1 Arbeitsbuch'] },
  { books: ['321082 P Schritte International Neu 1 Kursbuch+Arbeitsbuch', '621082 P Schritte International Neu 2 Kursbuch+Arbeitsbuch'] },
  { books: ['151051 P Beste Freunde PLUS A1.2 Arbeitsbuch - Interaktive Version', '631792 P Momente A2.1 Arbeitsbuch', '651792 P Momente A2.2 Arbeitsbuch'] }
];

export interface BookTotalRow {
  /** Artikelnummer und Titel */
  code: string;
  /** Anzahl Codes */
  quantity: number;
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

  /** Sipariş formu oluştur: mock siparişlerden toplamları hesapla */
  createOrderForm(): void {
    const countByCode: Record<string, number> = {};
    for (const order of MOCK_ORDERS) {
      for (const code of order.books) {
        countByCode[code] = (countByCode[code] || 0) + 1;
      }
    }
    this.bookTotals = Object.entries(countByCode)
      .map(([code, quantity]) => ({ code, quantity }))
      .sort((a, b) => a.code.localeCompare(b.code));
    this.previewReady = true;
    this.downloadSuccess = null;
  }

  closePreview(): void {
    this.previewReady = false;
  }

  /** Excel: head + Formular Bestellung formatında satırlar (5 sütun) */
  downloadExcel(): void {
    const rows: (string | number)[][] = HEAD_ROWS.map(row => [...row]);
    for (const row of this.bookTotals) {
      rows.push([
        row.quantity,
        '1',
        '3 jahre',
        row.code,
        'kostenlos'
      ]);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bestellung');
    XLSX.writeFile(wb, 'Formular_Bestellung_Digitallizenzen.xlsx');
    this.downloadSuccess = 'Excel dosyası indirildi. / Excel-Datei heruntergeladen.';
    setTimeout(() => (this.downloadSuccess = null), 4000);
  }

  get headRows(): string[][] {
    return HEAD_ROWS;
  }
}
