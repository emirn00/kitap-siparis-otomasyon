import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth.service";
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  login() {
    this.authService.login(this.email, this.password)
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error = 'Email or password is incorrect';
        }
      });
  }
}
