import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userData: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]]
    });

    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userData = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Kullanıcı bilgileri yüklenemedi';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const updateData = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone
      };

      this.authService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.successMessage = 'Profil bilgileriniz başarıyla güncellendi';
          this.userData = response;
          this.loading = false;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err) => {
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.status === 409) {
            this.errorMessage = 'Bu email veya telefon numarası zaten kullanılıyor';
          } else {
            this.errorMessage = 'Profil güncellenirken bir hata oluştu';
          }
          this.loading = false;
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }

  goBack(): void {
    this.router.navigate(['/order']);
  }
}
