import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../i18n/translation.service';
import { Router } from '@angular/router';

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
export class UserOrdersComponent implements OnInit {
  orders: UserOrderView[] = [];
  loading = false;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/api/orders/my-orders';

  constructor(
    private http: HttpClient,
    private translation: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
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
}

