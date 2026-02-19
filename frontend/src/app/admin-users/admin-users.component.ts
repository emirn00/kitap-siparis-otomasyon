import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../i18n/translation.service';

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
  editingUser: User | null = null;
  updateLoading = false;
  updateSuccess: string | null = null;
  updateError: string | null = null;
  deletingUserId: string | null = null;
  deleteLoading = false;
  deleteError: string | null = null;

  private apiUrl = 'http://localhost:8080/users';

  constructor(
    private http: HttpClient,
    private translation: TranslationService
  ) {}

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
        this.error = 'Kullanıcılar yüklenirken bir hata oluştu';
        this.loading = false;
      }
    });
  }

  startEdit(user: User): void {
    this.editingUser = { ...user };
    this.updateSuccess = null;
    this.updateError = null;
  }

  cancelEdit(): void {
    this.editingUser = null;
  }

  saveUser(): void {
    if (!this.editingUser) {
      return;
    }

    this.updateLoading = true;
    this.updateError = null;
    this.updateSuccess = null;

    const payload = {
      firstName: this.editingUser.firstName,
      lastName: this.editingUser.lastName,
      phone: this.editingUser.phone,
      role: this.editingUser.role
    };

    this.http.put<User>(`${this.apiUrl}/${this.editingUser.id}`, payload).subscribe({
      next: (updated) => {
        const index = this.users.findIndex(u => u.id === updated.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updated };
        }
        this.applyFilters();
        this.updateSuccess = 'Kullanıcı başarıyla güncellendi / Benutzer erfolgreich aktualisiert';
        this.updateLoading = false;
        this.editingUser = null;

        setTimeout(() => {
          this.updateSuccess = null;
        }, 3000);
      },
      error: () => {
        this.updateError = 'Kullanıcı güncellenirken bir hata oluştu / Beim Aktualisieren des Benutzers ist ein Fehler aufgetreten';
        this.updateLoading = false;
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
    const keyMap: { [key: string]: string } = {
      'USER': 'roleUser',
      'ADMIN': 'roleAdmin'
    };
    const key = keyMap[role];
    return key ? this.translation.get(key) : role;
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

  confirmDelete(user: User): void {
    this.deletingUserId = user.id;
    this.deleteError = null;
  }

  cancelDelete(): void {
    this.deletingUserId = null;
  }

  deleteUser(): void {
    if (!this.deletingUserId) {
      return;
    }

    this.deleteLoading = true;
    this.deleteError = null;

    this.http.delete<void>(`${this.apiUrl}/${this.deletingUserId}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.deletingUserId);
        this.applyFilters();
        this.deletingUserId = null;
        this.deleteLoading = false;
      },
      error: () => {
        this.deleteError = 'Kullanıcı silinirken bir hata oluştu / Beim Löschen des Benutzers ist ein Fehler aufgetreten';
        this.deleteLoading = false;
      }
    });
  }
}
