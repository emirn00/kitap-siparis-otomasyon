import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-custom-order',
  templateUrl: './admin-custom-order.component.html',
  styleUrls: ['./admin-custom-order.component.scss']
})
export class AdminCustomOrderComponent implements OnInit {
  customOrderForm!: FormGroup;
  availableBooks: string[] = [
    'Beste Freunde A 1.1 Arbeitsbuch',
    'Beste Freunde A 1.2 Arbeitsbuch',
    'Beste Freunde A 2.1 Arbeitsbuch',
    'Beste Freunde A 2.2 Arbeitsbuch',
    'Beste Freunde B 1.1 Arbeitsbuch',
    'Beste Freunde B 1.2 Arbeitsbuch',
    'Beste Freunde B 2.1 Arbeitsbuch',
    'Beste Freunde B 2.2 Arbeitsbuch'
  ];
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.customOrderForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: ['', [Validators.required]],
      selectedBooks: [[]],
      status: ['pending'],
      notes: ['']
    });
  }

  getSelectedBooksFormArray(): string[] {
    return this.customOrderForm.get('selectedBooks')?.value || [];
  }

  toggleBookSelection(bookName: string): void {
    const selectedBooks = this.getSelectedBooksFormArray();
    const index = selectedBooks.indexOf(bookName);

    if (index > -1) {
      selectedBooks.splice(index, 1);
    } else {
      selectedBooks.push(bookName);
    }

    this.customOrderForm.patchValue({ selectedBooks: selectedBooks });
  }

  isBookSelected(bookName: string): boolean {
    const selectedBooks = this.getSelectedBooksFormArray();
    return selectedBooks.includes(bookName);
  }

  onSubmit(): void {
    if (this.customOrderForm.valid) {
      // Backend'e gönderilecek
      console.log('Özel sipariş oluşturuldu:', this.customOrderForm.value);
      this.successMessage = 'Özel sipariş başarıyla oluşturuldu! / Spezielle Bestellung erfolgreich erstellt!';
      this.errorMessage = null;
      
      setTimeout(() => {
        this.successMessage = null;
        this.customOrderForm.reset();
        this.customOrderForm.patchValue({ status: 'pending', selectedBooks: [] });
      }, 3000);
    } else {
      this.customOrderForm.markAllAsTouched();
      this.errorMessage = 'Lütfen tüm zorunlu alanları doldurun. / Bitte füllen Sie alle Pflichtfelder aus.';
    }
  }

  get fullName() { return this.customOrderForm.get('fullName'); }
  get email() { return this.customOrderForm.get('email'); }
  get phone() { return this.customOrderForm.get('phone'); }
  get school() { return this.customOrderForm.get('school'); }
  get city() { return this.customOrderForm.get('city'); }
  get workingBooks() { return this.customOrderForm.get('workingBooks'); }
}
