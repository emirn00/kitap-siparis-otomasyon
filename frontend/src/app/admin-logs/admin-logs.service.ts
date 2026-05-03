import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemLog {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'MAIL' | 'USER_REGISTRATION' | 'SYSTEM';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLogsService {
  private apiUrl = 'http://localhost:8080/api/admin/logs';

  constructor(private http: HttpClient) { }

  getLogs(): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(this.apiUrl);
  }
}
