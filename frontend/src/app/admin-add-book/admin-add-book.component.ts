import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminBookStoreService } from '../admin/admin-book-store.service';
import { TranslationService } from '../i18n/translation.service';

@Component({
  selector: 'app-admin-add-book',
  templateUrl: './admin-add-book.component.html',
  styleUrls: ['./admin-add-book.component.scss']
})
export class AdminAddBookComponent implements OnInit {
  addBookForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookStore: AdminBookStoreService,
    private router: Router,
    private translation: TranslationService
  ) { }

  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      requestName: ['', [Validators.required, Validators.minLength(1)]],
      orderName: ['', [Validators.required, Validators.minLength(1)]],
      lisencodeName: ['', [Validators.required, Validators.minLength(1)]],
      isbn: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  onSubmit(): void {
    if (this.addBookForm.valid) {
      // POST api/books ile veritabanına kitap eklenir
      this.bookStore.addBook(this.addBookForm.value).subscribe({
        next: () => {
          this.successMessage = this.translation.get('addSuccess');
          this.errorMessage = null;
          this.addBookForm.reset();
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['/admin/books'], { queryParams: { added: 'true' } });
          }, 1500);
        },
        error: () => {
          this.errorMessage = this.translation.get('addBookFailed');
          this.successMessage = null;
        }
      });
    } else {
      this.addBookForm.markAllAsTouched();
      this.errorMessage = this.translation.get('fillAllFields');
    }
  }

  get requestName() { return this.addBookForm.get('requestName'); }
  get orderName() { return this.addBookForm.get('orderName'); }
  get lisencodeName() { return this.addBookForm.get('lisencodeName'); }
  get isbn() { return this.addBookForm.get('isbn'); }
}
