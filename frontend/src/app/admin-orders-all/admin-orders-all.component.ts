import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ApiOrderResponse {
  id: string;
  userId: string;
  userName: string;
  books: { id: string; title?: string }[];
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'pending' | 'processed' | 'completed';

interface AdminOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  workingBooks: string;
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
  showAddOrderForm: boolean = false;
  newOrderForm!: FormGroup;

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

  // Kitap ekleme için
  addingBookToOrderId: string | null = null;
  newBookName: string = '';

  loading = false;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initNewOrderForm();
    this.fetchOrders();
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

  fetchOrders(): void {
    this.loading = true;
    this.error = null;

    this.http.get<ApiOrderResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        // API'den gelen veriyi UI modeline map et
        this.orders = data.map(d => ({
          id: d.id,
          fullName: d.userName,
          email: '',
          phone: '',
          school: '',
          city: '',
          workingBooks: '',
          selectedBooks: (d.books || []).map(b => b.title || 'Kitap'),
          createdAt: new Date(d.createdAt),
          status: 'pending'
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Siparişler yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }

  // Kitap silme
  removeBookFromOrder(orderId: string, bookName: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const index = order.selectedBooks.indexOf(bookName);
      if (index > -1) {
        order.selectedBooks.splice(index, 1);
        this.applyFilters();
      }
    }
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

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
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
    const labels: { [key in OrderStatus]: string } = {
      pending: 'Beklemede',
      processed: 'İşleniyor',
      completed: 'Tamamlandı'
    };
    return labels[status] || status;
  }

  getStatusColor(status: OrderStatus): string {
    const colors: { [key in OrderStatus]: string } = {
      pending: '#ff9800',
      processed: '#2196f3',
      completed: '#4caf50'
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
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getProcessedOrders(): number {
    return this.orders.filter(order => order.status === 'processed').length;
  }

  getCompletedOrders(): number {
    return this.orders.filter(order => order.status === 'completed').length;
  }
}
