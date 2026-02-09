import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

@Component({
  selector: 'app-admin-order-form-builder',
  templateUrl: './admin-order-form-builder.component.html',
  styleUrls: ['./admin-order-form-builder.component.scss']
})
export class AdminOrderFormBuilderComponent implements OnInit {
  formBuilderForm!: FormGroup;
  formFields: FormField[] = [];
  previewMode: boolean = false;
  successMessage: string | null = null;

  fieldTypes = [
    { value: 'text', label: 'Metin / Text' },
    { value: 'email', label: 'E-posta / E-Mail' },
    { value: 'tel', label: 'Telefon / Telefon' },
    { value: 'select', label: 'Seçim / Auswahl' },
    { value: 'textarea', label: 'Çok Satırlı Metin / Mehrzeiliger Text' },
    { value: 'checkbox', label: 'Onay Kutusu / Checkbox' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formBuilderForm = this.fb.group({
      formName: ['', [Validators.required]],
      formDescription: [''],
      fields: this.fb.array([])
    });
  }

  get fieldsFormArray(): FormArray {
    return this.formBuilderForm.get('fields') as FormArray;
  }

  addField(): void {
    const fieldGroup = this.fb.group({
      type: ['text', Validators.required],
      label: ['', Validators.required],
      placeholder: [''],
      required: [false],
      options: this.fb.array([])
    });
    this.fieldsFormArray.push(fieldGroup);
  }

  removeField(index: number): void {
    this.fieldsFormArray.removeAt(index);
  }

  getFieldOptions(index: number): FormArray {
    return this.fieldsFormArray.at(index).get('options') as FormArray;
  }

  addOption(index: number): void {
    const optionsArray = this.getFieldOptions(index);
    optionsArray.push(this.fb.control(''));
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    const optionsArray = this.getFieldOptions(fieldIndex);
    optionsArray.removeAt(optionIndex);
  }

  togglePreview(): void {
    this.previewMode = !this.previewMode;
    if (this.previewMode) {
      this.buildPreviewFields();
    }
  }

  buildPreviewFields(): void {
    this.formFields = this.fieldsFormArray.value.map((field: any, index: number) => ({
      id: `field-${index}`,
      type: field.type,
      label: field.label,
      required: field.required,
      placeholder: field.placeholder,
      options: field.options || []
    }));
  }

  saveForm(): void {
    if (this.formBuilderForm.valid) {
      // Backend'e kaydedilecek
      console.log('Form kaydedildi:', this.formBuilderForm.value);
      this.successMessage = 'Form şablonu başarıyla kaydedildi! / Formularvorlage erfolgreich gespeichert!';
      
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    } else {
      this.formBuilderForm.markAllAsTouched();
    }
  }
}
