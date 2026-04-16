import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  currentDate = '';
  currentTime = '';
  userName = '';

  sidebarCollapsed = false;
  openGroups: { [key: string]: boolean } = { books: false, mail: false };

  pageTitle = 'Dashboard';
  pageIcon = 'fa-tachometer-alt';

  private timer: any;
  private routerSub!: Subscription;

  private readonly MONTHS_FULL = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.userName = userInfo?.fullName ?? 'Admin';
    this.updateDateTime();
    this.timer = setInterval(() => this.updateDateTime(), 1000);
    this.updatePageTitle();

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updatePageTitle());
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentDate = `${now.getDate()} ${this.MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`;
    this.currentTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private updatePageTitle(): void {
    const child = this.activatedRoute.firstChild;
    if (child?.snapshot?.data) {
      this.pageTitle = child.snapshot.data['title'] ?? 'Dashboard';
      this.pageIcon  = child.snapshot.data['icon']  ?? 'fa-tachometer-alt';
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleGroup(group: string): void {
    this.openGroups[group] = !this.openGroups[group];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
