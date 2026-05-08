import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { OrderBookService } from './order-book.service';
import { OrderApiService } from './order-api.service';
import { TranslationService } from '../i18n/translation.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface Book {
  id: string;
  name: string;
  imageUrl: string;
  level: string;
  selectedForWorking: boolean;
  selectedForCodes: boolean;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  orderForm!: FormGroup;
  showSummary = false;
  userInfo: { email: string; fullName: string; phoneNumber: string } | null = null;
  userName = '';
  currentDate = '';
  currentTime = '';
  private timer: any;

  private readonly MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  /** GET /api/books ile API'den çekilen kitaplar */
  books: Book[] = [];
  booksLoading = true;
  booksError: string | null = null;

  /** Sipariş gönderiliyor mu */
  orderSubmitting = false;
  orderError: string | null = null;

  /** Filtreleme, Arama ve Sayfalama */
  searchTerm = '';
  selectedLevel = 'all';
  filteredBooks: Book[] = [];
  
  paginatedBooks: Book[] = [];
  currentPage = 1;
  pageSize = 12;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBooks.length / this.pageSize));
  }

  private placeholderImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private orderBookService: OrderBookService,
    private orderApiService: OrderApiService,
    private translation: TranslationService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.userName = this.userInfo?.fullName ?? 'Kullanıcı';
    this.updateDateTime();
    this.timer = setInterval(() => this.updateDateTime(), 1000);

    this.orderForm = this.fb.group({
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: ['', [Validators.required]],
      selectedBooks: this.fb.array([])
    });

    this.loadBooksFromApi();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDate = `${now.getDate()} ${this.MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    this.currentTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  /** Kitapları GET /api/books ile API'den çeker (giriş yapmış kullanıcı token ile istek atar) */
  loadBooksFromApi(): void {
    this.booksLoading = true;
    this.booksError = null;
    this.orderBookService.getBooks(0, 500).subscribe({ // Increased limit to fetch more books for local filtering
      next: (res) => {
        this.books = (res.content || []).map(b => {
          // Extract level only if it's likely a level (e.g., max 10 chars like "A1.1")
          let level = '–';
          const possibleLevel = (b.lisencodeName || b.orderName || '').trim();
          if (possibleLevel && possibleLevel.length > 0 && possibleLevel.length <= 10) {
            level = possibleLevel;
          }

          return {
            id: String(b.id),
            name: b.requestName || '',
            imageUrl: this.placeholderImage,
            level: level,
            selectedForWorking: false,
            selectedForCodes: false
          };
        });
        this.applyFilters();
        this.booksLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.booksLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.booksError = this.translation.get('booksError');
          return;
        }
        this.booksError = this.translation.get('booksError');
      }
    });
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = !this.searchTerm || 
        book.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.level.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesLevel = this.selectedLevel === 'all' || book.level === this.selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
    this.currentPage = 1;
    this.updatePaginatedBooks();
  }

  updatePaginatedBooks(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedBooks = this.filteredBooks.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedBooks();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedBooks();
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onLevelChange(level: string): void {
    this.selectedLevel = level;
    this.applyFilters();
  }

  getLevels(): string[] {
    const levels = new Set(this.books.map(b => b.level).filter(l => l && l !== '–'));
    return Array.from(levels).sort();
  }

  get selectedBooksFormArray(): FormArray {
    return this.orderForm.get('selectedBooks') as FormArray;
  }

  onBookChange(book: Book, checked: boolean): void {
    const targetArray = this.selectedBooksFormArray;
    book.selectedForCodes = checked;
    if (checked) {
      targetArray.push(this.fb.control(book.id));
    } else {
      const index = targetArray.controls.findIndex(x => x.value === book.id);
      if (index !== -1) targetArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.selectedBooksFormArray.length > 0) {
      this.showSummary = true;
    } else {
      // Form geçersizse hataları göster
      this.orderForm.markAllAsTouched();
      if (this.selectedBooksFormArray.length === 0) {
        alert('Lütfen en az bir kitap seçiniz!');
      }
    }
  }

  onConfirm(): void {
    if (!this.authService.getToken()) {
      this.orderError = this.translation.get('sessionExpired');
      return;
    }
    const bookIds = this.selectedBooksFormArray.controls.map(c => c.value as string);
    if (bookIds.length === 0) {
      alert(this.translation.get('selectOneBook'));
      return;
    }
    const institution = this.orderForm.get('school')?.value ?? '';
    const city = this.orderForm.get('city')?.value ?? '';
    if (!institution.trim() || !city.trim()) {
      alert(this.translation.get('requiredField'));
      return;
    }

    this.orderSubmitting = true;
    this.orderError = null;
    this.orderApiService.createOrder({ bookIds, city, institution }).subscribe({
      next: () => {
        this.orderSubmitting = false;
        this.orderError = null;
        alert(this.translation.get('orderSuccess'));
        this.resetForm();
      },
      error: (err: HttpErrorResponse) => {
        this.orderSubmitting = false;
        if (err.status === 403) {
          this.orderError = this.translation.get('onlyUserOrder');
          return;
        }
        if (err.status === 401) {
          this.orderError = this.translation.get('sessionExpired');
          return;
        }
        this.orderError = this.translation.get('orderSendFailed');
      }
    });
  }

  onBack(): void {
    this.showSummary = false;
  }

  getSelectedBookNames(): string[] {
    return this.books
      .filter(book => book.selectedForCodes)
      .map(book => book.name);
  }

  resetForm(): void {
    this.orderForm.reset();
    this.selectedBooksFormArray.clear();
    this.books.forEach(book => {
      book.selectedForWorking = false;
      book.selectedForCodes = false;
    });
    this.showSummary = false;
  }

  get school() { return this.orderForm.get('school'); }
  get city() { return this.orderForm.get('city'); }
  get workingBooks() { return this.orderForm.get('workingBooks'); }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = 'assets/book-placeholder.png';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

