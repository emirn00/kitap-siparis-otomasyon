import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-help-form',
  templateUrl: './help-form.component.html',
  styleUrls: ['./help-form.component.scss']
})
export class HelpFormComponent implements OnInit {
  helpForm!: FormGroup;
  showSuccess = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.helpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.helpForm.valid) {
      // Burada backend'e mesaj gönderilecek
      console.log('Yardım Formu Gönderildi:', this.helpForm.value);
      
      this.showSuccess = true;
      setTimeout(() => {
        this.resetForm();
      }, 3000);
    } else {
      this.helpForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.helpForm.reset();
    this.showSuccess = false;
  }

  get fullName() { return this.helpForm.get('fullName'); }
  get email() { return this.helpForm.get('email'); }
  get phone() { return this.helpForm.get('phone'); }
  get subject() { return this.helpForm.get('subject'); }
  get message() { return this.helpForm.get('message'); }
}

