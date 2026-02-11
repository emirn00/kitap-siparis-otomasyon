import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminBookStoreService, AdminBook } from '../admin/admin-book-store.service';

@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.scss']
})
export class AdminBooksComponent implements OnInit {
  books: AdminBook[] = [];
  filteredBooks: AdminBook[] = [];
  searchTerm = '';
  editingBook: AdminBook | null = null;
  addSuccess: string | null = null;
  updateSuccess: string | null = null;
  updateError: string | null = null;
  deletingBookId: string | null = null;
  deleteError: string | null = null;

  constructor(
    private bookStore: AdminBookStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    const added = this.route.snapshot.queryParamMap.get('added');
    if (added === 'true' || added === '1') {
      this.addSuccess = 'Kitap başarıyla eklendi. / Buch erfolgreich hinzugefügt.';
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: '',
        replaceUrl: true
      });
      setTimeout(() => (this.addSuccess = null), 4000);
    }
  }

  loadBooks(): void {
    this.books = this.bookStore.getBooks();
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredBooks = term
      ? this.books.filter(
          b =>
            b.requestName.toLowerCase().includes(term) ||
            b.orderName.toLowerCase().includes(term) ||
            b.lisencodeName.toLowerCase().includes(term) ||
            b.isbn.toLowerCase().includes(term)
        )
      : [...this.books];
  }

  onSearch(): void {
    this.applyFilters();
  }

  startEdit(book: AdminBook): void {
    this.editingBook = { ...book };
    this.updateSuccess = null;
    this.updateError = null;
  }

  cancelEdit(): void {
    this.editingBook = null;
  }

  saveBook(): void {
    if (!this.editingBook) return;
    const updated = this.bookStore.updateBook(this.editingBook.id, {
      requestName: this.editingBook.requestName,
      orderName: this.editingBook.orderName,
      lisencodeName: this.editingBook.lisencodeName,
      isbn: this.editingBook.isbn
    });
    if (updated) {
      this.books = this.bookStore.getBooks();
      this.applyFilters();
      this.updateSuccess = 'Kitap güncellendi. / Buch aktualisiert.';
      this.editingBook = null;
      setTimeout(() => (this.updateSuccess = null), 3000);
    } else {
      this.updateError = 'Güncelleme başarısız. / Aktualisierung fehlgeschlagen.';
    }
  }

  confirmDelete(book: AdminBook): void {
    this.deletingBookId = book.id;
    this.deleteError = null;
  }

  cancelDelete(): void {
    this.deletingBookId = null;
  }

  deleteBook(): void {
    if (!this.deletingBookId) return;
    const ok = this.bookStore.deleteBook(this.deletingBookId);
    if (ok) {
      this.books = this.bookStore.getBooks();
      this.applyFilters();
      this.deletingBookId = null;
    } else {
      this.deleteError = 'Silme başarısız. / Löschen fehlgeschlagen.';
    }
  }

  getTotalBooks(): number {
    return this.books.length;
  }
}
