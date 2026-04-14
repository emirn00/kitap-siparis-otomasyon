import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  currentDate = '';
  currentTime = '';
  userName = '';
  private timer: any;

  private readonly MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.userName = userInfo?.fullName ?? 'Admin';
    this.updateDateTime();
    this.timer = setInterval(() => this.updateDateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDate = `${now.getDate()} ${this.MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    this.currentTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
