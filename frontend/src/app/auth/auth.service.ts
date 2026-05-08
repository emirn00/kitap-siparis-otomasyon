import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, tap, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';
  private loginState = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loginState$ = this.loginState.asObservable();

  constructor(private http: HttpClient) { }

  login(request: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.loginState.next(true);
      })
    );
  }

  register(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }


  private decodeJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    return payload ? payload.role : null;
  }

  getUserInfo(): { email: string; fullName: string; phoneNumber: string } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload) return null;
      return {
        email: payload.email,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber
      };
    } catch (e) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload) return false;
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (e) {
      return false;
    }
  }


  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.loginState.next(false);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/users/me');
  }

  updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Observable<any> {
    return this.http.put<any>('http://localhost:8080/users/me', profileData);
  }
}
