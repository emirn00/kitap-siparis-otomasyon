import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';

interface Book {
  id: number;
  name: string;
  imageUrl: string;
  level: string; // A1.1, A1.2, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2
  selectedForWorking: boolean;
  selectedForCodes: boolean;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  showSummary = false;
  
  // Static kitap listesi - backend'den çekilecek
  books: Book[] = [
    { 
      id: 1, 
      name: 'Beste Freunde A 1.1 Arbeitsbuch', 
      level: 'A1.1',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 2, 
      name: 'Beste Freunde A 1.2 Arbeitsbuch', 
      level: 'A1.2',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 3, 
      name: 'Beste Freunde A 2.1 Arbeitsbuch', 
      level: 'A2.1',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 4, 
      name: 'Beste Freunde A 2.2 Arbeitsbuch', 
      level: 'A2.2',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 5, 
      name: 'Beste Freunde B 1.1 Arbeitsbuch', 
      level: 'B1.1',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 6, 
      name: 'Beste Freunde B 1.2 Arbeitsbuch', 
      level: 'B1.2',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 7, 
      name: 'Beste Freunde B 2.1 Arbeitsbuch', 
      level: 'B2.1',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    },
    { 
      id: 8, 
      name: 'Beste Freunde B 2.2 Arbeitsbuch', 
      level: 'B2.2',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      selectedForWorking: false, 
      selectedForCodes: false 
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      workingBooks: ['', [Validators.required]],
      selectedBooks: this.fb.array([])
    });
  }

  get selectedBooksFormArray(): FormArray {
    return this.orderForm.get('selectedBooks') as FormArray;
  }

  onBookChange(book: Book, event: any): void {
    const targetArray = this.selectedBooksFormArray;
    
    if (event.checked) {
      book.selectedForCodes = true;
      targetArray.push(this.fb.control(book.id));
    } else {
      book.selectedForCodes = false;
      const index = targetArray.controls.findIndex(x => x.value === book.id);
      targetArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.selectedBooksFormArray.length > 0) {
      this.showSummary = true;
    } else {
      // Form geçersizse hataları göster
      this.orderForm.markAllAsTouched();
      if (this.selectedBooksFormArray.length === 0) {
        alert('Lütfen en az bir kitap seçiniz!');
      }
    }
  }

  onConfirm(): void {
    // Burada backend'e sipariş gönderilecek
    console.log('Sipariş Onaylandı:', {
      ...this.orderForm.value,
      selectedBookNames: this.getSelectedBookNames()
    });
    
    alert('Siparişiniz başarıyla alındı!');
    this.resetForm();
  }

  onBack(): void {
    this.showSummary = false;
  }

  getSelectedBookNames(): string[] {
    return this.books
      .filter(book => book.selectedForCodes)
      .map(book => book.name);
  }

  resetForm(): void {
    this.orderForm.reset();
    this.selectedBooksFormArray.clear();
    this.books.forEach(book => {
      book.selectedForWorking = false;
      book.selectedForCodes = false;
    });
    this.showSummary = false;
  }

  get fullName() { return this.orderForm.get('fullName'); }
  get email() { return this.orderForm.get('email'); }
  get phone() { return this.orderForm.get('phone'); }
  get school() { return this.orderForm.get('school'); }
  get city() { return this.orderForm.get('city'); }
  get workingBooks() { return this.orderForm.get('workingBooks'); }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/book-placeholder.png';
    }
  }
}

