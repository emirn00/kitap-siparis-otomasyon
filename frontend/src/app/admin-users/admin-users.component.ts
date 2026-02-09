import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  roleFilter: string = 'all';
  loading = false;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.error = null;

    // Backend'den kullanıcıları çek (admin endpoint'i olmalı)
    // Şimdilik placeholder - gerçek endpoint'e göre güncellenebilir
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        // API yoksa örnek veri göster
        this.users = [
          {
            id: '1',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            email: 'ahmet@example.com',
            phone: '05551234567',
            role: 'USER',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            firstName: 'Maria',
            lastName: 'Schmidt',
            email: 'maria@example.com',
            phone: '05559876543',
            role: 'USER',
            createdAt: new Date().toISOString()
          }
        ];
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const searchTermTrimmed = this.searchTerm.trim().toLowerCase();
    
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !searchTermTrimmed ||
        user.firstName.toLowerCase().includes(searchTermTrimmed) ||
        user.lastName.toLowerCase().includes(searchTermTrimmed) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTermTrimmed) ||
        user.email.toLowerCase().includes(searchTermTrimmed) ||
        user.phone.includes(searchTermTrimmed);

      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'USER': 'Kullanıcı / Benutzer',
      'ADMIN': 'Yönetici / Administrator'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'USER': '#2196f3',
      'ADMIN': '#d32f2f'
    };
    return colors[role] || '#666';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getAdminUsers(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }

  getNormalUsers(): number {
    return this.users.filter(user => user.role === 'USER').length;
  }
}
