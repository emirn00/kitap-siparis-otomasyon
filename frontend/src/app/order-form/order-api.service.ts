import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderRequest {
  bookIds: string[];
  city: string;
  institution: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  userName: string;
  books: { id: string; requestName?: string }[];
  city: string;
  institution: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  /** Sipariş oluşturur; admin orders sayfasında GET /api/orders ile listelenir */
  createOrder(body: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, body);
  }
}
