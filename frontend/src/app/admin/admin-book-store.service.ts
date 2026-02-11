import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminBook {
  id: string;
  requestName: string;
  orderName: string;
  lisencodeName: string;
  isbn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBookStoreService {
  private books: AdminBook[] = [];
  private books$ = new BehaviorSubject<AdminBook[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('admin_books');
      if (raw) {
        this.books = JSON.parse(raw);
        this.books$.next([...this.books]);
      }
    } catch {
      this.books = [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem('admin_books', JSON.stringify(this.books));
      this.books$.next([...this.books]);
    } catch {}
  }

  getBooks(): AdminBook[] {
    return [...this.books];
  }

  getBooksObservable() {
    return this.books$.asObservable();
  }

  addBook(book: Omit<AdminBook, 'id'>): AdminBook {
    const id = `book-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newBook: AdminBook = { ...book, id };
    this.books.push(newBook);
    this.persist();
    return newBook;
  }

  updateBook(id: string, data: Partial<Omit<AdminBook, 'id'>>): AdminBook | null {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.books[index] = { ...this.books[index], ...data };
    this.persist();
    return this.books[index];
  }

  deleteBook(id: string): boolean {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    this.persist();
    return true;
  }

  getBookById(id: string): AdminBook | null {
    return this.books.find(b => b.id === id) || null;
  }
}
