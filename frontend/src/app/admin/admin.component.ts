import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataset, ChartOptions } from 'chart.js';

interface ApiOrderResponse {
  id: string;
  books: { id: string; title?: string; requestName?: string }[];
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  loading = false;

  // KPI
  totalOrders = 0;
  completedOrders = 0;
  pendingOrders = 0;
  canceledOrders = 0;
  totalBooksOrdered = 0;

  // Monthly line chart
  monthlyChartLabels: string[] = [];
  monthlyChartData: ChartDataset[] = [];
  monthlyChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } },
      x: { grid: { display: false } }
    }
  };

  // Status doughnut
  statusDoughnutLabels: string[] = ['Tamamlanan', 'Bekleyen', 'İptal'];
  statusDoughnutData: ChartDataset[] = [];
  doughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
    cutout: '65%'
  } as ChartOptions;

  // Status bar
  statusBarLabels: string[] = ['Tamamlanan', 'Bekleyen', 'İptal'];
  statusBarData: ChartDataset[] = [];
  statusBarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  // Top books horizontal bar
  topBooksLabels: string[] = [];
  topBooksData: ChartDataset[] = [];
  topBooksOptions: ChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  } as ChartOptions;

  // Weekly trend
  weeklyChartLabels: string[] = [];
  weeklyChartData: ChartDataset[] = [];
  weeklyChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  // Completion rate
  completionRateLabels: string[] = [];
  completionRateData: ChartDataset[] = [];
  completionRateOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v) => v + '%' } },
      x: { grid: { display: false } }
    }
  } as ChartOptions;

  private readonly MONTHS_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.http.get<ApiOrderResponse[]>(this.apiUrl).subscribe({
      next: (orders) => {
        this.buildKPIs(orders);
        this.buildMonthlyChart(orders);
        this.buildStatusCharts(orders);
        this.buildTopBooksChart(orders);
        this.buildWeeklyChart(orders);
        this.buildCompletionRateChart(orders);
        this.loading = false;
      },
      error: () => { this.useDemoData(); this.loading = false; }
    });
  }

  private buildKPIs(orders: ApiOrderResponse[]): void {
    this.totalOrders = orders.length;
    this.completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    this.pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    this.canceledOrders = orders.filter(o => o.status === 'CANCELED' || o.status === 'CANCELLED').length;
    this.totalBooksOrdered = orders.reduce((acc, o) => acc + (o.books?.length ?? 0), 0);
  }

  private buildMonthlyChart(orders: ApiOrderResponse[]): void {
    const now = new Date();
    const labels: string[] = [];
    const counts: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(this.MONTHS_TR[d.getMonth()] + ' ' + d.getFullYear().toString().slice(2));
      counts.push(orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      }).length);
    }
    this.monthlyChartLabels = labels;
    this.monthlyChartData = [{ data: counts, borderColor: '#d32f2f', backgroundColor: 'rgba(211,47,47,0.12)', pointBackgroundColor: '#d32f2f', pointRadius: 5, fill: true, tension: 0.4, borderWidth: 2.5 }];
  }

  private buildStatusCharts(orders: ApiOrderResponse[]): void {
    const c = orders.filter(o => o.status === 'COMPLETED').length;
    const p = orders.filter(o => o.status === 'PENDING').length;
    const x = orders.filter(o => o.status === 'CANCELED' || o.status === 'CANCELLED').length;
    this.statusDoughnutData = [{ data: [c, p, x], backgroundColor: ['#2e7d32','#f57c00','#c62828'], borderWidth: 2, borderColor: '#fff' }];
    this.statusBarData = [{ data: [c, p, x], backgroundColor: ['rgba(46,125,50,0.85)','rgba(245,124,0,0.85)','rgba(198,40,40,0.85)'], borderRadius: 6, borderSkipped: false } as ChartDataset];
  }

  private buildTopBooksChart(orders: ApiOrderResponse[]): void {
    const bc: { [t: string]: number } = {};
    orders.forEach(o => (o.books ?? []).forEach(b => {
      const t = (b.title ?? b.requestName ?? 'Bilinmeyen').slice(0, 28);
      bc[t] = (bc[t] ?? 0) + 1;
    }));
    const sorted = Object.entries(bc).sort((a,b) => b[1]-a[1]).slice(0,8);
    this.topBooksLabels = sorted.map(e => e[0]);
    this.topBooksData = [{ data: sorted.map(e => e[1]), backgroundColor: ['rgba(211,47,47,0.8)','rgba(211,47,47,0.7)','rgba(211,47,47,0.6)','rgba(211,47,47,0.5)','rgba(211,47,47,0.45)','rgba(211,47,47,0.4)','rgba(211,47,47,0.35)','rgba(211,47,47,0.3)'], borderRadius: 4 } as ChartDataset];
  }

  private buildWeeklyChart(orders: ApiOrderResponse[]): void {
    const now = new Date();
    const labels: string[] = [];
    const counts: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const s = new Date(now); s.setDate(now.getDate() - i * 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      labels.push(`H${8 - i}`);
      counts.push(orders.filter(o => { const od = new Date(o.createdAt); return od >= s && od <= e; }).length);
    }
    this.weeklyChartLabels = labels;
    this.weeklyChartData = [{ data: counts, borderColor: '#1565c0', backgroundColor: 'rgba(21,101,192,0.12)', pointBackgroundColor: '#1565c0', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4 }];
  }

  private buildCompletionRateChart(orders: ApiOrderResponse[]): void {
    const now = new Date();
    const labels: string[] = [];
    const rates: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(this.MONTHS_TR[d.getMonth()]);
      const mo = orders.filter(o => { const od = new Date(o.createdAt); return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth(); });
      rates.push(mo.length > 0 ? Math.round((mo.filter(o => o.status === 'COMPLETED').length / mo.length) * 100) : 0);
    }
    this.completionRateLabels = labels;
    this.completionRateData = [{ data: rates, backgroundColor: rates.map(r => r >= 75 ? 'rgba(46,125,50,0.8)' : r >= 50 ? 'rgba(245,124,0,0.8)' : 'rgba(198,40,40,0.8)'), borderRadius: 6, borderSkipped: false } as ChartDataset];
  }

  private useDemoData(): void {
    this.totalOrders = 142; this.completedOrders = 98; this.pendingOrders = 31; this.canceledOrders = 13; this.totalBooksOrdered = 389;
    this.monthlyChartLabels = ['Kas 24','Ara 24','Oca 25','Şub 25','Mar 25','Nis 25','May 25','Haz 25','Tem 25','Ağu 25','Eyl 25','Eki 25'];
    this.monthlyChartData = [{ data: [8,12,9,15,18,22,14,17,11,9,20,16], borderColor: '#d32f2f', backgroundColor: 'rgba(211,47,47,0.12)', pointBackgroundColor: '#d32f2f', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 5 }];
    this.statusDoughnutData = [{ data: [98,31,13], backgroundColor: ['#2e7d32','#f57c00','#c62828'], borderWidth: 2, borderColor: '#fff' }];
    this.statusBarData = [{ data: [98,31,13], backgroundColor: ['rgba(46,125,50,0.85)','rgba(245,124,0,0.85)','rgba(198,40,40,0.85)'], borderRadius: 6, borderSkipped: false } as ChartDataset];
    this.topBooksLabels = ['Beste Freunde A1.1','Beste Freunde A1.2','Beste Freunde A2.1','Beste Freunde B1.1','Beste Freunde A2.2','Beste Freunde B1.2','Beste Freunde B2.1','Beste Freunde B2.2'];
    this.topBooksData = [{ data: [62,48,41,38,35,28,22,15], backgroundColor: ['rgba(211,47,47,0.8)','rgba(211,47,47,0.7)','rgba(211,47,47,0.6)','rgba(211,47,47,0.5)','rgba(211,47,47,0.45)','rgba(211,47,47,0.4)','rgba(211,47,47,0.35)','rgba(211,47,47,0.3)'], borderRadius: 4 } as ChartDataset];
    this.weeklyChartLabels = ['H1','H2','H3','H4','H5','H6','H7','H8'];
    this.weeklyChartData = [{ data: [4,7,3,9,5,8,6,11], borderColor: '#1565c0', backgroundColor: 'rgba(21,101,192,0.12)', pointBackgroundColor: '#1565c0', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4 }];
    this.completionRateLabels = ['May','Haz','Tem','Ağu','Eyl','Eki'];
    this.completionRateData = [{ data: [72,85,68,91,78,83], backgroundColor: ['rgba(245,124,0,0.8)','rgba(46,125,50,0.8)','rgba(245,124,0,0.8)','rgba(46,125,50,0.8)','rgba(46,125,50,0.8)','rgba(46,125,50,0.8)'], borderRadius: 6, borderSkipped: false } as ChartDataset];
  }
}
