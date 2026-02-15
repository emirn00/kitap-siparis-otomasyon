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
  /** GET /api/books listesi yükleniyor mu */
  booksLoading = true;
  booksLoadError: string | null = null;

  constructor(
    private bookStore: AdminBookStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.bookStore.getBooksObservable().subscribe(books => {
      this.books = books;
      this.applyFilters();
    });

    // Kitaplar listesini GET api/books ile API'den çek
    this.loadBooksFromApi();

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

  /** Tüm kitaplar listesi GET /api/books ile API'den çekilir (id yok) */
  loadBooksFromApi(): void {
    this.booksLoading = true;
    this.booksLoadError = null;
    this.bookStore.loadBooksFromApi(this.searchTerm).subscribe({
      next: () => {
        this.booksLoading = false;
        this.booksLoadError = null;
      },
      error: () => {
        this.booksLoading = false;
        this.booksLoadError = 'Kitaplar yüklenemedi. / Bücher konnten nicht geladen werden.';
      }
    });
  }

  applyFilters(): void {
    // With server-side filtering, we just show what's in the store
    this.filteredBooks = [...this.books];
  }

  onSearch(): void {
    this.loadBooksFromApi();
  }

  onLoadMore(): void {
    this.bookStore.loadMore();
  }

  hasMore(): boolean {
    return this.bookStore.hasMore();
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
    this.bookStore.updateBook(this.editingBook.id, {
      requestName: this.editingBook.requestName,
      orderName: this.editingBook.orderName,
      isbn: this.editingBook.isbn,
      lisencodeName: this.editingBook.lisencodeName
    }).subscribe({
      next: (updated) => {
        this.updateSuccess = 'Kitap güncellendi. / Buch aktualisiert.';
        this.editingBook = null;
        setTimeout(() => (this.updateSuccess = null), 3000);
      },
      error: (err) => {
        this.updateError = 'Güncelleme başarısız. / Aktualisierung fehlgeschlagen.';
      }
    });
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
    this.bookStore.deleteBook(this.deletingBookId).subscribe({
      next: () => {
        this.deletingBookId = null;
      },
      error: (err) => {
        this.deleteError = 'Silme başarısız. / Löschen fehlgeschlagen.';
      }
    });
  }

  getTotalBooks(): number {
    return this.books.length;
  }
}
