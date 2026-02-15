import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminBookStoreService } from '../admin/admin-book-store.service';

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
    private router: Router
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
          this.successMessage = 'Kitap başarıyla eklendi. / Buch erfolgreich hinzugefügt.';
          this.errorMessage = null;
          this.addBookForm.reset();
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['/admin/books'], { queryParams: { added: 'true' } });
          }, 1500);
        },
        error: () => {
          this.errorMessage = 'Ekleme başarısız. / Hinzufügen fehlgeschlagen.';
          this.successMessage = null;
        }
      });
    } else {
      this.addBookForm.markAllAsTouched();
      this.errorMessage = 'Lütfen tüm alanları doldurun. / Bitte füllen Sie alle Felder aus.';
    }
  }

  get requestName() { return this.addBookForm.get('requestName'); }
  get orderName() { return this.addBookForm.get('orderName'); }
  get lisencodeName() { return this.addBookForm.get('lisencodeName'); }
  get isbn() { return this.addBookForm.get('isbn'); }
}
