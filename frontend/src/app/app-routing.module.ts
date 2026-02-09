import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { HelpFormComponent } from './help-form/help-form.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminOrdersAllComponent } from './admin-orders-all/admin-orders-all.component';
import { AdminOrdersByDateComponent } from './admin-orders-by-date/admin-orders-by-date.component';
import { AdminCustomOrderComponent } from './admin-custom-order/admin-custom-order.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';
import { AdminOrderFormBuilderComponent } from './admin-order-form-builder/admin-order-form-builder.component';
import { AdminAssistantComponent } from './admin-assistant/admin-assistant.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'order',
    component: OrderFormComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/orders',
    component: AdminOrdersAllComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/orders-by-date',
    component: AdminOrdersByDateComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/custom-order',
    component: AdminCustomOrderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/logs',
    component: AdminLogsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/order-form-builder',
    component: AdminOrderFormBuilderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/assistant',
    component: AdminAssistantComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
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
