import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../i18n/translation.service';
import { AdminLogsService, SystemLog } from './admin-logs.service';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit {
  logs: SystemLog[] = [];
  filteredLogs: SystemLog[] = [];
  typeFilter: string = 'all';
  searchTerm: string = '';
  loading = true;

  constructor(
    private translation: TranslationService,
    private logsService: AdminLogsService
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.logsService.getLogs().subscribe({
      next: (data) => {
        // Sort by date descending
        this.logs = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Logs could not be loaded', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = !term ||
        log.title.toLowerCase().includes(term) ||
        log.message.toLowerCase().includes(term);

      const matchesType = this.typeFilter === 'all' || log.type === this.typeFilter;

      return matchesSearch && matchesType;
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'ORDER': return 'fa-shopping-cart';
      case 'MAIL': return 'fa-envelope';
      case 'USER_REGISTRATION': return 'fa-user-plus';
      default: return 'fa-info-circle';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'ORDER': return 'Sipariş';
      case 'MAIL': return 'E-posta';
      case 'USER_REGISTRATION': return 'Yeni Kayıt';
      default: return 'Sistem';
    }
  }

  getBadgeClass(type: string): string {
    return `badge-${type.toLowerCase()}`;
  }
}
