import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../i18n/translation.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface UserOrderView {
  id: string;
  createdAt: Date;
  city: string;
  institution: string;
  status: string;
  books: string[];
}

interface ApiOrderResponse {
  id: string;
  city: string;
  institution: string;
  status: string;
  createdAt: string;
  books: { requestName: string; orderName: string; isbn: string }[];
}

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss']
})
export class UserOrdersComponent implements OnInit, OnDestroy {
  orders: UserOrderView[] = [];
  loading = false;
  error: string | null = null;
  userName = '';
  currentDate = '';
  currentTime = '';
  private timer: any;

  private readonly MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  private apiUrl = 'http://localhost:8080/api/orders/my-orders';

  constructor(
    private http: HttpClient,
    private translation: TranslationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.userName = userInfo?.fullName ?? 'Kullanıcı';
    this.updateDateTime();
    this.timer = setInterval(() => this.updateDateTime(), 1000);
    this.fetchOrders();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDate = `${now.getDate()} ${this.MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    this.currentTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  fetchOrders(): void {
    this.loading = true;
    this.error = null;
    this.http.get<ApiOrderResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.orders = data.map(d => ({
          id: d.id,
          createdAt: new Date(d.createdAt),
          city: d.city ?? '',
          institution: d.institution ?? '',
          status: d.status,
          books: (d.books || []).map(b => b.orderName || b.requestName || b.isbn)
        }));
        this.loading = false;
      },
      error: () => {
        this.error = this.translation.get('userOrdersLoadError');
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getStatusLabel(status: string): string {
    const key = status === 'COMPLETED'
      ? 'statusCompleted'
      : status === 'CANCELED'
        ? 'statusCanceled'
        : 'statusPending';
    return this.translation.get(key);
  }

  goBack(): void {
    this.router.navigate(['/order']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

