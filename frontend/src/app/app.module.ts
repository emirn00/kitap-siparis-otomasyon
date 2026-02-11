import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrderFormComponent } from './order-form/order-form.component';
import { HelpFormComponent } from './help-form/help-form.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './auth/login/login.component';
import {AuthInterceptor} from "./auth/auth.interceptor";
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

@NgModule({
  declarations: [
    AppComponent,
    OrderFormComponent,
    HelpFormComponent,
    AdminComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    AdminOrdersAllComponent,
    AdminCustomOrderComponent,
    AdminUsersComponent,
    AdminLogsComponent,
    AdminOrderFormBuilderComponent,
    AdminAssistantComponent,
    AdminAddBookComponent,
    AdminBooksComponent,
    AdminSendMailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatStepperModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
