import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../i18n/translation.service';

interface LogEntry {
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  timestamp: Date;
  message: string;
  details?: string;
  user?: string;
  action?: string;
}

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  levelFilter: string = 'all';
  searchTerm: string = '';

  constructor(private translation: TranslationService) {}

  ngOnInit(): void {
    // Örnek log verileri - gerçek uygulamada backend'den gelecek
    this.logs = [
      {
        level: 'INFO',
        timestamp: new Date(),
        message: 'Yeni sipariş oluşturuldu',
        details: 'Sipariş ID: 12345',
        user: 'admin@hueber.com',
        action: 'CREATE_ORDER'
      },
      {
        level: 'SUCCESS',
        timestamp: new Date(Date.now() - 3600000),
        message: 'Kullanıcı başarıyla kaydedildi',
        details: 'Kullanıcı: Ahmet Yılmaz',
        user: 'admin@hueber.com',
        action: 'CREATE_USER'
      },
      {
        level: 'WARNING',
        timestamp: new Date(Date.now() - 7200000),
        message: 'Sipariş durumu güncellendi',
        details: 'Sipariş ID: 12344 durumu "İşleniyor" olarak değiştirildi',
        user: 'admin@hueber.com',
        action: 'UPDATE_ORDER'
      },
      {
        level: 'ERROR',
        timestamp: new Date(Date.now() - 10800000),
        message: 'Sipariş silme işlemi başarısız',
        details: 'Sipariş ID: 12343 bulunamadı',
        user: 'admin@hueber.com',
        action: 'DELETE_ORDER'
      },
      {
        level: 'INFO',
        timestamp: new Date(Date.now() - 14400000),
        message: 'Sistem yedeklemesi tamamlandı',
        details: 'Yedekleme başarıyla oluşturuldu',
        user: 'system',
        action: 'BACKUP'
      }
    ];
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onLevelFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const matchesSearch = !this.searchTerm ||
        log.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (log.user && log.user.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesLevel = this.levelFilter === 'all' || log.level === this.levelFilter;

      return matchesSearch && matchesLevel;
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getLevelLabel(level: string): string {
    const keyMap: { [key: string]: string } = {
      'INFO': 'levelInfo',
      'WARNING': 'levelWarning',
      'ERROR': 'levelError',
      'SUCCESS': 'levelSuccess'
    };
    const key = keyMap[level];
    return key ? this.translation.get(key) : level;
  }

  getTotalLogs(): number {
    return this.logs.length;
  }

  getInfoLogs(): number {
    return this.logs.filter(log => log.level === 'INFO').length;
  }

  getWarningLogs(): number {
    return this.logs.filter(log => log.level === 'WARNING').length;
  }

  getErrorLogs(): number {
    return this.logs.filter(log => log.level === 'ERROR').length;
  }
}
