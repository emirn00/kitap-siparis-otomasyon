import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

interface Book {
  id: string;
  requestName: string;
}

@Component({
  selector: 'app-admin-custom-order',
  templateUrl: './admin-custom-order.component.html',
  styleUrls: ['./admin-custom-order.component.scss']
})
export class AdminCustomOrderComponent implements OnInit {
  customOrderForm!: FormGroup;
  allBooks: Book[] = [];
  selectedBooks: Book[] = [];
  
  loadingBooks = false;
  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Modal control
  showBookModal = false;
  bookSearchTerm = '';

  private apiUrl = 'http://localhost:8080/api/orders/custom';
  private booksUrl = 'http://localhost:8080/api/books';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchAllBooks();
  }

  initForm(): void {
    this.customOrderForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: [''], // Opsiyonel, notlara eklenebilir
      notes: [''],
      status: ['PENDING']
    });
  }

  fetchAllBooks(): void {
    this.loadingBooks = true;
    // API 100 kitap çeksin (sayfalama şimdilik basit tutuldu)
    this.http.get<{ content: Book[] }>(this.booksUrl, { params: { size: '200' } }).subscribe({
      next: (res) => {
        this.allBooks = res.content || [];
        this.loadingBooks = false;
      },
      error: () => {
        this.errorMessage = 'Kitap listesi yüklenemedi.';
        this.loadingBooks = false;
      }
    });
  }

  openBookModal(): void {
    this.showBookModal = true;
    this.bookSearchTerm = '';
  }

  closeBookModal(): void {
    this.showBookModal = false;
  }

  toggleBookSelection(book: Book): void {
    const index = this.selectedBooks.findIndex(b => b.id === book.id);
    if (index > -1) {
      this.selectedBooks.splice(index, 1);
    } else {
      this.selectedBooks.push(book);
    }
  }

  isBookSelected(book: Book): boolean {
    return this.selectedBooks.some(b => b.id === book.id);
  }

  get filteredBooks(): Book[] {
    const term = this.bookSearchTerm.trim().toLowerCase();
    if (!term) return this.allBooks;
    return this.allBooks.filter(b => b.requestName.toLowerCase().includes(term));
  }

  removeBook(bookId: string): void {
    this.selectedBooks = this.selectedBooks.filter(b => b.id !== bookId);
  }

  onSubmit(): void {
    if (this.customOrderForm.valid && this.selectedBooks.length > 0) {
      this.submitting = true;
      this.successMessage = null;
      this.errorMessage = null;

      const formValue = this.customOrderForm.value;
      const requestBody = {
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        city: formValue.city,
        institution: formValue.school,
        bookIds: this.selectedBooks.map(b => b.id),
        notes: formValue.notes + (formValue.workingBooks ? `\nÇalışılan Kitaplar: ${formValue.workingBooks}` : '')
      };

      this.http.post(this.apiUrl, requestBody)
        .pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: () => {
            this.successMessage = 'Özel sipariş başarıyla veritabanına kaydedildi!';
            this.resetForm();
          },
          error: (err) => {
            this.errorMessage = 'Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
            console.error('Order Error:', err);
          }
        });
    } else if (this.selectedBooks.length === 0) {
      this.errorMessage = 'Lütfen en az bir kitap seçin.';
    } else {
      this.customOrderForm.markAllAsTouched();
      this.errorMessage = 'Lütfen tüm zorunlu alanları doğru doldurun.';
    }
  }

  resetForm(): void {
    this.customOrderForm.reset({
      status: 'PENDING'
    });
    this.selectedBooks = [];
    setTimeout(() => this.successMessage = null, 5000);
  }

  get fullName() { return this.customOrderForm.get('fullName'); }
  get email() { return this.customOrderForm.get('email'); }
  get phone() { return this.customOrderForm.get('phone'); }
  get school() { return this.customOrderForm.get('school'); }
  get city() { return this.customOrderForm.get('city'); }
}
