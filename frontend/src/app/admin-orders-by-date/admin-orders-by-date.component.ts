import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface OrderResponse {
  id: string;
  userId: string;
  userName: string;
  books: { id: string; title?: string }[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-orders-by-date',
  templateUrl: './admin-orders-by-date.component.html',
  styleUrls: ['./admin-orders-by-date.component.scss']
})
export class AdminOrdersByDateComponent {

  startDate: string = '';
  endDate: string = '';
  orders: OrderResponse[] = [];
  loading = false;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/api/orders/by-date';

  constructor(private http: HttpClient) {}

  fetchOrdersByDate(): void {
    if (!this.startDate || !this.endDate) {
      this.error = 'Lütfen başlangıç ve bitiş tarihlerini seçiniz.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.get<OrderResponse[]>(`${this.apiUrl}?startDate=${this.startDate}&endDate=${this.endDate}`).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Siparişler yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('tr-TR');
  }
}
