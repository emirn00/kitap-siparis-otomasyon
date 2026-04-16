import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { HelpFormComponent } from './help-form/help-form.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminOrdersAllComponent } from './admin-orders-all/admin-orders-all.component';
import { AdminCustomOrderComponent } from './admin-custom-order/admin-custom-order.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';
import { AdminOrderFormBuilderComponent } from './admin-order-form-builder/admin-order-form-builder.component';
import { AdminAssistantComponent } from './admin-assistant/admin-assistant.component';
import { AdminAddBookComponent } from './admin-add-book/admin-add-book.component';
import { AdminBooksComponent } from './admin-books/admin-books.component';
import { AdminSendMailComponent } from './admin-send-mail/admin-send-mail.component';
import { AdminLisencodeCsvComponent } from './admin-lisencode-csv/admin-lisencode-csv.component';
import { AdminBulkMailComponent } from './admin-bulk-mail/admin-bulk-mail.component';
import { UserOrdersComponent } from './user-orders/user-orders.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'order', component: OrderFormComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: UserOrdersComponent, canActivate: [AuthGuard] },

  // Admin shell — sidebar persistent across all admin pages
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: '',
        component: AdminComponent,
        data: { title: 'Dashboard', icon: 'fa-tachometer-alt' }
      },
      {
        path: 'orders',
        component: AdminOrdersAllComponent,
        data: { title: 'Siparişler', icon: 'fa-shopping-cart' }
      },
      {
        path: 'books',
        component: AdminBooksComponent,
        data: { title: 'Kitap Listesi', icon: 'fa-book' }
      },
      {
        path: 'add-book',
        component: AdminAddBookComponent,
        data: { title: 'Kitap Ekle', icon: 'fa-plus-circle' }
      },
      {
        path: 'send-mail',
        component: AdminSendMailComponent,
        data: { title: 'Mail Gönder', icon: 'fa-paper-plane' }
      },
      {
        path: 'bulk-mail',
        component: AdminBulkMailComponent,
        data: { title: 'Toplu Mail', icon: 'fa-mail-bulk' }
      },
      {
        path: 'custom-order',
        component: AdminCustomOrderComponent,
        data: { title: 'Özel Sipariş', icon: 'fa-pen-nib' }
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        data: { title: 'Kullanıcılar', icon: 'fa-users' }
      },
      {
        path: 'logs',
        component: AdminLogsComponent,
        data: { title: 'Loglar', icon: 'fa-file-alt' }
      },
      {
        path: 'order-form-builder',
        component: AdminOrderFormBuilderComponent,
        data: { title: 'Form Builder', icon: 'fa-tools' }
      },
      {
        path: 'lisencode-csv',
        component: AdminLisencodeCsvComponent,
        data: { title: 'Lisencode CSV', icon: 'fa-file-csv' }
      },
      {
        path: 'assistant',
        component: AdminAssistantComponent,
        data: { title: 'Asistan', icon: 'fa-robot' }
      }
    ]
  },

  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
