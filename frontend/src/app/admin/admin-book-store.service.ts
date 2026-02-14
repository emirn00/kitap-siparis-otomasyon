import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AdminBook {
  id: string;
  requestName: string;
  orderName: string;
  lisencodeName?: string;
  isbn: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBookStoreService {
  private apiUrl = 'http://localhost:8080/api/books';
  private books: AdminBook[] = [];
  private books$ = new BehaviorSubject<AdminBook[]>([]);
  private isLastPage = false;
  private currentPage = 0;
  private currentSearch = '';

  constructor(private http: HttpClient) {
    this.refreshBooks();
  }

  refreshBooks(searchTerm: string = '', size: number = 20): void {
    this.currentSearch = searchTerm;
    this.currentPage = 0;
    this.fetchBooks(this.currentPage, size, this.currentSearch).subscribe(res => {
      this.books = res.content;
      this.isLastPage = res.last;
      this.books$.next([...this.books]);
    });
  }

  loadMore(size: number = 20): void {
    if (this.isLastPage) return;
    this.currentPage++;
    this.fetchBooks(this.currentPage, size, this.currentSearch).subscribe(res => {
      this.books = [...this.books, ...res.content];
      this.isLastPage = res.last;
      this.books$.next([...this.books]);
    });
  }

  private fetchBooks(page: number, size: number, searchTerm: string): Observable<PageResponse<AdminBook>> {
    let params: any = { page, size };
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    return this.http.get<PageResponse<AdminBook>>(this.apiUrl, { params }).pipe(
      catchError(err => {
        console.error('Error fetching books', err);
        return throwError(() => err);
      })
    );
  }

  hasMore(): boolean {
    return !this.isLastPage;
  }

  getBooks(): AdminBook[] {
    return [...this.books];
  }

  getBooksObservable(): Observable<AdminBook[]> {
    return this.books$.asObservable();
  }

  addBook(book: Omit<AdminBook, 'id'>): Observable<AdminBook> {
    return this.http.post<AdminBook>(this.apiUrl, book).pipe(
      tap(newBook => {
        this.books.push(newBook);
        this.books$.next([...this.books]);
      }),
      catchError(err => {
        console.error('Error adding book', err);
        return throwError(() => err);
      })
    );
  }

  updateBook(id: string, data: Partial<Omit<AdminBook, 'id'>>): Observable<AdminBook> {
    const currentBook = this.books.find(b => b.id === id);
    const updatedBook = { ...currentBook, ...data } as AdminBook;

    return this.http.put<AdminBook>(`${this.apiUrl}/${id}`, updatedBook).pipe(
      tap(res => {
        const index = this.books.findIndex(b => b.id === id);
        if (index !== -1) {
          this.books[index] = res;
          this.books$.next([...this.books]);
        }
      }),
      catchError(err => {
        console.error('Error updating book', err);
        return throwError(() => err);
      })
    );
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const index = this.books.findIndex(b => b.id === id);
        if (index !== -1) {
          this.books.splice(index, 1);
          this.books$.next([...this.books]);
        }
      }),
      catchError(err => {
        console.error('Error deleting book', err);
        return throwError(() => err);
      })
    );
  }

  getBookById(id: string): AdminBook | null {
    return this.books.find(b => b.id === id) || null;
  }
}
