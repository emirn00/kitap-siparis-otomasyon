import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { HelpFormComponent } from './help-form/help-form.component';

const routes: Routes = [
  { path: '', component: OrderFormComponent },
  { path: 'yardim', component: HelpFormComponent },
  { path: 'help', component: HelpFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
