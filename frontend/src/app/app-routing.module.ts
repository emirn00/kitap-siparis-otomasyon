import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { HelpFormComponent } from './help-form/help-form.component';
import { AdminComponent } from './admin/admin.component';
import {LoginComponent} from "./auth/login/login.component";
import {AuthGuard} from "./auth/auth.guard";

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'order',
    component: OrderFormComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },

  { path: 'yardim', component: HelpFormComponent },
  { path: 'help', component: HelpFormComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
