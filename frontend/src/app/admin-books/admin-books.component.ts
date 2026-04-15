import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminBookStoreService, AdminBook } from '../admin/admin-book-store.service';
import { TranslationService } from '../i18n/translation.service';

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
  booksLoading = true;
  booksLoadError: string | null = null;

  currentPage = 1;
  readonly pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.filteredBooks.length / this.pageSize);
  }

  get paginatedBooks(): AdminBook[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBooks.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pageRangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredBooks.length);
  }

  constructor(
    private bookStore: AdminBookStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private translation: TranslationService
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
      this.addSuccess = this.translation.get('addSuccess');
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
        this.booksLoadError = this.translation.get('booksError');
      }
    });
  }

  applyFilters(): void {
    this.filteredBooks = [...this.books];
    this.currentPage = 1;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBooksFromApi();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

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
    // Formda düzenlenen değerler listedeki kitap nesnesinde (book-card [book] binding); güncel hali listeden al
    const current = this.books.find(b => b.id === this.editingBook!.id);
    if (!current) return;
    this.bookStore.updateBook(current.id, {
      requestName: current.requestName,
      orderName: current.orderName,
      isbn: current.isbn,
      lisencodeName: current.lisencodeName
    }).subscribe({
      next: (updated) => {
        this.updateSuccess = this.translation.get('bookUpdated');
        this.editingBook = null;
        setTimeout(() => (this.updateSuccess = null), 3000);
      },
      error: () => {
        this.updateError = this.translation.get('bookUpdateFailed');
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
      error: () => {
        this.deleteError = this.translation.get('bookDeleteFailed');
      }
    });
  }

  getTotalBooks(): number {
    return this.books.length;
  }
}
