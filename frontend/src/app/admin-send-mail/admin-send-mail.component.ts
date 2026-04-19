import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../i18n/translation.service';

interface OrderBookResponse {
  id: string;
  requestName: string;
  interactiveCode?: string;
}

interface OrderResponse {
  id: string;
  userName: string;
  email: string;
  books: OrderBookResponse[];
  mailed: boolean;
  status: string;
  createdAt: string;
}

interface MailPreview {
  to: string;
  subject: string;
  body: string;
}

@Component({
  selector: 'app-admin-send-mail',
  templateUrl: './admin-send-mail.component.html',
  styleUrls: ['./admin-send-mail.component.scss']
})
export class AdminSendMailComponent implements OnInit {

  private readonly mailApiUrl = 'http://localhost:8080/api/orders/mail';

  ordersReady: OrderResponse[] = [];
  loading = false;
  error: string | null = null;
  
  // Preview
  selectedOrder: OrderResponse | null = null;
  preview: MailPreview | null = null;
  previewLoading = false;
  showPreviewModal = false;

  // Sending
  sending = false;
  successMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.fetchReadyOrders();
  }

  fetchReadyOrders(): void {
    this.loading = true;
    this.error = null;
    this.http.get<OrderResponse[]>(`${this.mailApiUrl}/ready`).subscribe({
      next: (data) => {
        this.ordersReady = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Gönderime hazır siparişler yüklenemedi.';
        this.loading = false;
      }
    });
  }

  openPreview(order: OrderResponse): void {
    this.selectedOrder = order;
    this.previewLoading = true;
    this.showPreviewModal = true;
    this.preview = null;

    this.http.get<MailPreview>(`${this.mailApiUrl}/preview/${order.id}`).subscribe({
      next: (data) => {
        this.preview = data;
        this.previewLoading = false;
      },
      error: () => {
        this.error = 'Mail önizlemesi oluşturulamadı.';
        this.previewLoading = false;
      }
    });
  }

  closePreview(): void {
    this.showPreviewModal = false;
    this.selectedOrder = null;
    this.preview = null;
  }

  sendMail(): void {
    if (!this.selectedOrder) return;

    this.sending = true;
    this.http.post(`${this.mailApiUrl}/send/${this.selectedOrder.id}`, {}).subscribe({
      next: () => {
        this.sending = false;
        this.showPreviewModal = false;
        this.successMessage = 'Mail başarıyla kuyruğa alındı!';
        this.fetchReadyOrders(); // Refresh list
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: () => {
        this.sending = false;
        this.error = 'Mail gönderilirken bir hata oluştu.';
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
