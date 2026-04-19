import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from '../i18n/translation.service';

interface ApiOrderResponse {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  phone?: string;
  books: { id: string; title?: string; requestName?: string; interactiveCode?: string }[];
  city?: string;
  institution?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

export interface OrderBookItem {
  id: string;
  requestName: string;
  interactiveCode?: string;
}

interface AdminOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  workingBooks: string;
  /** API'den gelen kitaplar (id ile); düzenleme ve PUT için */
  books: OrderBookItem[];
  selectedBooks: string[];
  createdAt: Date;
  status: OrderStatus;
}

@Component({
  selector: 'app-admin-orders-all',
  templateUrl: './admin-orders-all.component.html',
  styleUrls: ['./admin-orders-all.component.scss']
})
export class AdminOrdersAllComponent implements OnInit {

  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];

  searchTerm: string = '';
  statusFilter: string = 'all';
  startDate: string = '';
  endDate: string = '';
  dateFilterActive = false;
  showAddOrderForm: boolean = false;
  newOrderForm!: FormGroup;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 20;

  // Kitap listesi (frontend tarafı için)
  availableBooks: string[] = [
    'Beste Freunde A 1.1 Arbeitsbuch',
    'Beste Freunde A 1.2 Arbeitsbuch',
    'Beste Freunde A 2.1 Arbeitsbuch',
    'Beste Freunde A 2.2 Arbeitsbuch',
    'Beste Freunde B 1.1 Arbeitsbuch',
    'Beste Freunde B 1.2 Arbeitsbuch',
    'Beste Freunde B 2.1 Arbeitsbuch',
    'Beste Freunde B 2.2 Arbeitsbuch'
  ];

  addingBookToOrderId: string | null = null;
  newBookName: string = '';

  /** Seçili kitapları düzenle: hangi sipariş açık */
  editingOrderId: string | null = null;
  /** Düzenleme sırasında siparişteki kitap listesi (kopya) */
  editBooksList: OrderBookItem[] = [];
  /** Tüm kitaplar (API'den, kitap eklemek için) */
  allBooks: OrderBookItem[] = [];
  allBooksLoading = false;
  /** Kitap ekle listesinde arama metni */
  addBookSearchTerm = '';
  editBooksError: string | null = null;
  editBooksSaving = false;

  /** Sipariş silme onayı */
  deletingOrderId: string | null = null;
  deleteOrderError: string | null = null;

  loading = false;
  error: string | null = null;

  // Books Modal
  showBooksModal: boolean = false;
  selectedOrderForModal: AdminOrder | null = null;

  private apiUrl = 'http://localhost:8080/api/orders';
  private booksUrl = 'http://localhost:8080/api/books';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private translation: TranslationService
  ) { }

  ngOnInit(): void {
    this.initNewOrderForm();
    this.fetchOrders();
  }

  openBooksModal(order: AdminOrder): void {
    this.selectedOrderForModal = order;
    this.showBooksModal = true;
  }

  closeBooksModal(): void {
    this.showBooksModal = false;
    this.selectedOrderForModal = null;
  }

  initNewOrderForm(): void {
    this.newOrderForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: ['', [Validators.required]],
      selectedBooks: [[]],
      status: ['pending']
    });
  }

  private mapApiOrderToAdmin(d: ApiOrderResponse): AdminOrder {
    const books: OrderBookItem[] = (d.books || []).map(b => ({
      id: b.id,
      requestName: b.requestName || b.title || 'Kitap',
      interactiveCode: b.interactiveCode
    }));
    return {
      id: d.id,
      fullName: d.userName,
      email: d.email ?? '',
      phone: d.phone ?? '',
      school: d.institution ?? '',
      city: d.city ?? '',
      workingBooks: '',
      books,
      selectedBooks: books.map(b => b.requestName),
      createdAt: new Date(d.createdAt),
      status: d.status as OrderStatus
    };
  }

  fetchOrders(): void {
    this.loading = true;
    this.error = null;
    this.dateFilterActive = false;

    this.http.get<ApiOrderResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.orders = data.map(d => this.mapApiOrderToAdmin(d));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Siparişler yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }

  /** Tarihe göre filtreleme: GET /api/orders/by-date */
  fetchOrdersByDate(): void {
    if (!this.startDate || !this.endDate) {
      this.error = 'Lütfen başlangıç ve bitiş tarihlerini seçiniz. / Bitte Start- und Enddatum wählen.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.dateFilterActive = true;

    const byDateUrl = `${this.apiUrl}/by-date?startDate=${this.startDate}&endDate=${this.endDate}`;

    this.http.get<ApiOrderResponse[]>(byDateUrl).subscribe({
      next: (data) => {
        this.orders = data.map(d => this.mapApiOrderToAdmin(d));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Siparişler yüklenirken bir hata oluştu. Tarih aralığını kontrol edin.';
        this.loading = false;
      }
    });
  }

  resetDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.dateFilterActive = false;
    this.fetchOrders();
  }

  // --- Seçili kitapları düzenle (kitap ekle / çıkar) ---
  startEditBooks(order: AdminOrder): void {
    this.editingOrderId = order.id;
    this.editBooksList = order.books.map(b => ({ ...b }));
    this.editBooksError = null;
    this.loadAllBooksForEdit();
  }

  /** Tüm kitapları API'den sayfa sayfa çeker (kitap ekle listesi için) */
  private loadAllBooksForEdit(): void {
    this.allBooksLoading = true;
    this.allBooks = [];
    const size = 100;
    let page = 0;
    const fetchPage = () => {
      this.http.get<{ content: { id: string; requestName: string }[]; last: boolean }>(this.booksUrl, { params: { page, size } }).subscribe({
        next: (res) => {
          const chunk = (res.content || []).map(b => ({ id: b.id, requestName: b.requestName }));
          this.allBooks = [...this.allBooks, ...chunk];
          if (res.last === false && chunk.length === size) {
            page++;
            fetchPage();
          } else {
            this.allBooksLoading = false;
          }
        },
        error: () => {
          this.allBooksLoading = false;
        }
      });
    };
    fetchPage();
  }

  cancelEditBooks(): void {
    this.editingOrderId = null;
    this.editBooksList = [];
    this.addBookSearchTerm = '';
    this.editBooksError = null;
  }

  removeBookFromEdit(bookId: string): void {
    this.editBooksList = this.editBooksList.filter(b => b.id !== bookId);
  }

  addBookToEdit(book: OrderBookItem): void {
    if (this.editBooksList.some(b => b.id === book.id)) return;
    this.editBooksList = [...this.editBooksList, { ...book }];
  }

  getAvailableBooksToAdd(): OrderBookItem[] {
    const ids = new Set(this.editBooksList.map(b => b.id));
    return this.allBooks.filter(b => !ids.has(b.id));
  }

  /** Aranacak kitaplar: eklenebilir kitaplar + arama metni ile filtrelenir */
  getFilteredBooksToAdd(): OrderBookItem[] {
    const available = this.getAvailableBooksToAdd();
    const term = (this.addBookSearchTerm || '').trim().toLowerCase();
    if (!term) return available;
    return available.filter(b => b.requestName.toLowerCase().includes(term));
  }

  saveOrderBooks(): void {
    if (!this.editingOrderId) return;
    const order = this.orders.find(o => o.id === this.editingOrderId!);
    if (!order) return;

    this.editBooksSaving = true;
    this.editBooksError = null;
    const body = {
      bookIds: this.editBooksList.map(b => b.id),
      city: order.city,
      institution: order.school
    };

    this.http.put<ApiOrderResponse>(`${this.apiUrl}/${this.editingOrderId}`, body).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === this.editingOrderId!);
        if (idx !== -1) {
          this.orders[idx] = this.mapApiOrderToAdmin(updated);
        }
        this.applyFilters();
        this.cancelEditBooks();
        this.editBooksSaving = false;
      },
      error: () => {
        this.editBooksError = 'Güncelleme başarısız. / Aktualisierung fehlgeschlagen.';
        this.editBooksSaving = false;
      }
    });
  }

  // --- Sipariş sil (DELETE /api/orders/{id}) ---
  confirmDeleteOrder(orderId: string): void {
    this.deletingOrderId = orderId;
    this.deleteOrderError = null;
  }

  cancelDeleteOrder(): void {
    this.deletingOrderId = null;
    this.deleteOrderError = null;
  }

  deleteOrder(): void {
    if (!this.deletingOrderId) return;
    this.http.delete(`${this.apiUrl}/${this.deletingOrderId}`).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== this.deletingOrderId);
        this.applyFilters();
        this.deletingOrderId = null;
      },
      error: () => {
        this.deleteOrderError = 'Sipariş silinemedi. / Bestellung konnte nicht gelöscht werden.';
      }
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    this.http.patch<ApiOrderResponse>(`${this.apiUrl}/${orderId}/status?status=${status}`, {}).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          this.orders[idx] = this.mapApiOrderToAdmin(updated);
        }
        this.applyFilters();
      },
      error: () => {
        this.error = 'Sipariş durumu güncellenemedi. / Bestellstatus konnte nicht aktualisiert werden.';
      }
    });
  }

  // Özel sipariş formunu aç / kapa
  toggleAddOrderForm(): void {
    this.showAddOrderForm = !this.showAddOrderForm;
    if (this.showAddOrderForm) {
      this.initNewOrderForm();
    }
  }

  // Özel sipariş ekle (sadece frontend tarafında listeye ekler)
  addCustomOrder(): void {
    if (this.newOrderForm.valid) {
      const formValue = this.newOrderForm.value;
      const newOrder: AdminOrder = {
        id: Date.now().toString(),
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        school: formValue.school,
        city: formValue.city,
        workingBooks: formValue.workingBooks,
        books: [],
        selectedBooks: formValue.selectedBooks || [],
        createdAt: new Date(),
        status: formValue.status || 'pending'
      };

      this.orders.unshift(newOrder);
      this.applyFilters();
      this.toggleAddOrderForm();
    } else {
      this.newOrderForm.markAllAsTouched();
    }
  }

  // Formdaki seçili kitaplar
  getSelectedBooksFormArray(): string[] {
    return this.newOrderForm.get('selectedBooks')?.value || [];
  }

  toggleBookInNewOrder(bookName: string): void {
    const selectedBooks = this.getSelectedBooksFormArray();
    const index = selectedBooks.indexOf(bookName);

    if (index > -1) {
      selectedBooks.splice(index, 1);
    } else {
      selectedBooks.push(bookName);
    }

    this.newOrderForm.patchValue({ selectedBooks: selectedBooks });
  }

  isBookSelectedInNewOrder(bookName: string): boolean {
    const selectedBooks = this.getSelectedBooksFormArray();
    return selectedBooks.includes(bookName);
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  get paginatedOrders(): AdminOrder[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm ||
        order.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.school.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.city.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  getStatusLabel(status: OrderStatus): string {
    const keyMap: { [key in OrderStatus]: string } = {
      PENDING: 'statusPending',
      COMPLETED: 'statusCompleted',
      CANCELED: 'statusCanceled'
    };
    const key = keyMap[status];
    return key ? this.translation.get(key) : status;
  }

  getStatusColor(status: OrderStatus): string {
    const colors: { [key in OrderStatus]: string } = {
      PENDING: '#ff9800',
      COMPLETED: '#4caf50',
      CANCELED: '#f44336'
    };
    return colors[status] || '#666';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'PENDING').length;
  }

  getCompletedOrders(): number {
    return this.orders.filter(order => order.status === 'COMPLETED').length;
  }

  getCanceledOrders(): number {
    return this.orders.filter(order => order.status === 'CANCELED').length;
  }
}
