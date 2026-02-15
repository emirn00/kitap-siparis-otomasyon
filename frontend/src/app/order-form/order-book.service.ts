import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiBook {
  id: string;
  requestName: string;
  orderName: string;
  isbn: string;
  lisencodeName?: string;
}

export interface BooksPageResponse {
  content: ApiBook[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrderBookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  getBooks(page: number = 0, size: number = 100, searchTerm?: string): Observable<BooksPageResponse> {
    const params: { page: string; size: string; searchTerm?: string } = {
      page: String(page),
      size: String(size)
    };
    if (searchTerm?.trim()) params.searchTerm = searchTerm.trim();
    return this.http.get<BooksPageResponse>(this.apiUrl, { params });
  }
}
