import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

interface Order {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  workingBooks: string;
  selectedBooks: string[];
  createdAt: Date;
  status: 'pending' | 'processed' | 'completed';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  showAddOrderForm: boolean = false;
  newOrderForm!: FormGroup;
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
  addingBookToOrderId: number | null = null;
  newBookName: string = '';

  constructor(private fb: FormBuilder) {}

  // Mock data - Database'den çekilecek
  ngOnInit(): void {
    this.initNewOrderForm();
    this.orders = [
      {
        id: 1,
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        phone: '05551234567',
        school: 'İstanbul Lisesi - Anadolu Kampüsü',
        city: 'İstanbul',
        workingBooks: 'Beste Freunde 1,2,3 - Schritte International Neu 1 und 2',
        selectedBooks: ['Beste Freunde A 1.1 Arbeitsbuch', 'Beste Freunde A 1.2 Arbeitsbuch'],
        createdAt: new Date('2024-01-15'),
        status: 'pending'
      },
      {
        id: 2,
        fullName: 'Maria Schmidt',
        email: 'maria.schmidt@example.com',
        phone: '05412345678',
        school: 'Ankara Üniversitesi - Merkez Kampüs',
        city: 'Ankara',
        workingBooks: 'Beste Freunde 2,3 - Schritte International Neu 2',
        selectedBooks: ['Beste Freunde A 2.1 Arbeitsbuch', 'Beste Freunde A 2.2 Arbeitsbuch', 'Beste Freunde B 1.1 Arbeitsbuch'],
        createdAt: new Date('2024-01-16'),
        status: 'processed'
      },
      {
        id: 3,
        fullName: 'Mehmet Demir',
        email: 'mehmet.demir@example.com',
        phone: '05321234567',
        school: 'İzmir Fen Lisesi',
        city: 'İzmir',
        workingBooks: 'Beste Freunde 1 - Schritte International Neu 1',
        selectedBooks: ['Beste Freunde A 1.1 Arbeitsbuch'],
        createdAt: new Date('2024-01-17'),
        status: 'completed'
      },
      {
        id: 4,
        fullName: 'Anna Müller',
        email: 'anna.muller@example.com',
        phone: '05559876543',
        school: 'Berlin Schule - Hauptcampus',
        city: 'Berlin',
        workingBooks: 'Beste Freunde 1,2,3,4 - Schritte International Neu 1,2,3',
        selectedBooks: ['Beste Freunde A 1.1 Arbeitsbuch', 'Beste Freunde A 1.2 Arbeitsbuch', 'Beste Freunde A 2.1 Arbeitsbuch', 'Beste Freunde A 2.2 Arbeitsbuch'],
        createdAt: new Date('2024-01-18'),
        status: 'pending'
      }
    ];
    this.filteredOrders = this.orders;
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

  removeBookFromOrder(orderId: number, bookName: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const index = order.selectedBooks.indexOf(bookName);
      if (index > -1) {
        order.selectedBooks.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  startAddingBook(orderId: number): void {
    this.addingBookToOrderId = orderId;
    this.newBookName = '';
  }

  cancelAddingBook(): void {
    this.addingBookToOrderId = null;
    this.newBookName = '';
  }

  addBookToOrder(orderId: number): void {
    if (!this.newBookName.trim()) {
      return;
    }
    
    const order = this.orders.find(o => o.id === orderId);
    if (order && !order.selectedBooks.includes(this.newBookName)) {
      order.selectedBooks.push(this.newBookName);
      this.cancelAddingBook();
      this.applyFilters();
    }
  }

  toggleAddOrderForm(): void {
    this.showAddOrderForm = !this.showAddOrderForm;
    if (this.showAddOrderForm) {
      this.initNewOrderForm();
    }
  }

  addCustomOrder(): void {
    if (this.newOrderForm.valid) {
      const formValue = this.newOrderForm.value;
      const newOrder: Order = {
        id: Math.max(...this.orders.map(o => o.id), 0) + 1,
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Beklemede',
      'processed': 'İşleniyor',
      'completed': 'Tamamlandı'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#ff9800',
      'processed': '#2196f3',
      'completed': '#4caf50'
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

