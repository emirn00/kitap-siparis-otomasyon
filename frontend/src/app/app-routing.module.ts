import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';

const routes: Routes = [
  { path: '', component: OrderFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
