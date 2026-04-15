import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../i18n/translation.service';

interface BookEntry {
  bookName: string;
  licenseKey: string;
}

interface MailSendLog {
  id: string;
  instructorName: string;
  instructorEmail: string;
  sentAt: Date;
  books: BookEntry[];
  status: 'SUCCESS' | 'ERROR';
}

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit {
  logs: MailSendLog[] = [];
  filteredLogs: MailSendLog[] = [];
  statusFilter: string = 'all';
  searchTerm: string = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  copiedId: string | null = null;

  constructor(private translation: TranslationService) {}

  ngOnInit(): void {
    this.logs = [
      {
        id: 'log-001',
        instructorName: 'Prof. Dr. Ayşe Kaya',
        instructorEmail: 'ayse.kaya@istanbul.edu.tr',
        sentAt: new Date(),
        status: 'SUCCESS',
        books: [
          { bookName: 'Schritte International Neu A1', licenseKey: 'HBR-A1-2024-XKMP-9271' },
          { bookName: 'Schritte International Neu A2', licenseKey: 'HBR-A2-2024-LNQR-4483' },
          { bookName: 'Hueber Deutsch B1 Kurs', licenseKey: 'HBR-B1-2024-YWVZ-7615' },
        ]
      },
      {
        id: 'log-002',
        instructorName: 'Doç. Dr. Mehmet Arslan',
        instructorEmail: 'mehmet.arslan@ankara.edu.tr',
        sentAt: new Date(Date.now() - 3 * 3600000),
        status: 'SUCCESS',
        books: [
          { bookName: 'Panorama A1 Kursbuch', licenseKey: 'HBR-PA1-2024-CRFT-3319' },
          { bookName: 'Panorama A2 Kursbuch', licenseKey: 'HBR-PA2-2024-DMSK-8802' },
        ]
      },
      {
        id: 'log-003',
        instructorName: 'Arş. Gör. Zeynep Demir',
        instructorEmail: 'zeynep.demir@ege.edu.tr',
        sentAt: new Date(Date.now() - 24 * 3600000),
        status: 'SUCCESS',
        books: [
          { bookName: 'Menschen A1 Kursbuch', licenseKey: 'HBR-MA1-2024-PQJN-5544' },
          { bookName: 'Menschen A2 Kursbuch', licenseKey: 'HBR-MA2-2024-BVTX-2231' },
          { bookName: 'Menschen B1 Kursbuch', licenseKey: 'HBR-MB1-2024-GHWU-9908' },
          { bookName: 'Menschen B2 Kursbuch', licenseKey: 'HBR-MB2-2024-SZRQ-1176' },
        ]
      },
      {
        id: 'log-004',
        instructorName: 'Dr. Fatma Yıldız',
        instructorEmail: 'fatma.yildiz@marmara.edu.tr',
        sentAt: new Date(Date.now() - 2 * 24 * 3600000),
        status: 'ERROR',
        books: [
          { bookName: 'em neu Hauptkurs B2', licenseKey: 'HBR-EN-2024-KLOP-6637' },
        ]
      },
      {
        id: 'log-005',
        instructorName: 'Prof. Dr. Can Öztürk',
        instructorEmail: 'can.ozturk@gazi.edu.tr',
        sentAt: new Date(Date.now() - 3 * 24 * 3600000),
        status: 'SUCCESS',
        books: [
          { bookName: 'Delfin Lehrwerk A2', licenseKey: 'HBR-DL-2024-MNWY-4450' },
          { bookName: 'Delfin Lehrwerk B1', licenseKey: 'HBR-DL-2024-RVCE-7723' },
        ]
      },
    ];
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onDateChange(): void {
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = !term ||
        log.instructorName.toLowerCase().includes(term) ||
        log.instructorEmail.toLowerCase().includes(term) ||
        log.books.some(b =>
          b.bookName.toLowerCase().includes(term) ||
          b.licenseKey.toLowerCase().includes(term)
        );

      const matchesStatus = this.statusFilter === 'all' || log.status === this.statusFilter;

      const logDate = new Date(log.sentAt);
      const fromOk = !this.dateFrom || logDate >= this.startOfDay(this.dateFrom);
      const toOk   = !this.dateTo   || logDate <= this.endOfDay(this.dateTo);

      return matchesSearch && matchesStatus && fromOk && toOk;
    });
  }

  private startOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private endOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTotalMails(): number {
    return this.logs.length;
  }

  getTotalBooks(): number {
    return this.logs.reduce((sum, log) => sum + log.books.length, 0);
  }

  getSuccessCount(): number {
    return this.logs.filter(l => l.status === 'SUCCESS').length;
  }

  getErrorCount(): number {
    return this.logs.filter(l => l.status === 'ERROR').length;
  }

  copyLicense(key: string, id: string): void {
    navigator.clipboard.writeText(key).then(() => {
      this.copiedId = id;
      setTimeout(() => {
        this.copiedId = null;
      }, 2000);
    });
  }
}
