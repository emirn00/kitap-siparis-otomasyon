import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AuthService } from '../auth/auth.service';
import { OrderBookService } from './order-book.service';
import { OrderApiService } from './order-api.service';
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
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  showSummary = false;
  userInfo: { email: string; fullName: string; phoneNumber: string } | null = null;

  /** GET /api/books ile API'den çekilen kitaplar */
  books: Book[] = [];
  booksLoading = true;
  booksError: string | null = null;

  /** Sipariş gönderiliyor mu */
  orderSubmitting = false;
  orderError: string | null = null;

  private placeholderImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private orderBookService: OrderBookService,
    private orderApiService: OrderApiService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();

    this.orderForm = this.fb.group({
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: ['', [Validators.required]],
      selectedBooks: this.fb.array([])
    });

    this.loadBooksFromApi();
  }

  /** Kitapları GET /api/books ile API'den çeker (giriş yapmış kullanıcı token ile istek atar) */
  loadBooksFromApi(): void {
    this.booksLoading = true;
    this.booksError = null;
    this.orderBookService.getBooks(0, 100).subscribe({
      next: (res) => {
        this.books = (res.content || []).map(b => ({
          id: String(b.id),
          name: b.requestName || '',
          imageUrl: this.placeholderImage,
          level: b.lisencodeName || b.orderName || '–',
          selectedForWorking: false,
          selectedForCodes: false
        }));
        this.booksLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.booksLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.booksError = 'Oturum gerekli. Lütfen giriş yapın. / Bitte anmelden.';
          return;
        }
        this.booksError = 'Kitaplar yüklenemedi. / Bücher konnten nicht geladen werden.';
      }
    });
  }

  get selectedBooksFormArray(): FormArray {
    return this.orderForm.get('selectedBooks') as FormArray;
  }

  onBookChange(book: Book, event: MatCheckboxChange): void {
    const targetArray = this.selectedBooksFormArray;
    const checked = !!event.checked;
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
      this.orderError = 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın. / Bitte erneut anmelden.';
      return;
    }
    const bookIds = this.selectedBooksFormArray.controls.map(c => c.value as string);
    if (bookIds.length === 0) {
      alert('Lütfen en az bir kitap seçiniz!');
      return;
    }
    const institution = this.orderForm.get('school')?.value ?? '';
    const city = this.orderForm.get('city')?.value ?? '';
    if (!institution.trim() || !city.trim()) {
      alert('Okul ve şehir alanları zorunludur.');
      return;
    }

    this.orderSubmitting = true;
    this.orderError = null;
    this.orderApiService.createOrder({ bookIds, city, institution }).subscribe({
      next: () => {
        this.orderSubmitting = false;
        this.orderError = null;
        alert('Siparişiniz başarıyla alındı! Admin siparişler sayfasında görünecektir.');
        this.resetForm();
      },
      error: (err: HttpErrorResponse) => {
        this.orderSubmitting = false;
        if (err.status === 403) {
          this.orderError = 'Sadece kullanıcı (USER) sipariş verebilir. Admin hesabıyla giriş yaptıysanız, çıkış yapıp kullanıcı hesabıyla giriş yapın.';
          return;
        }
        if (err.status === 401) {
          this.orderError = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın. / Bitte erneut anmelden.';
          return;
        }
        this.orderError = 'Sipariş gönderilemedi. / Bestellung konnte nicht gesendet werden.';
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
}

