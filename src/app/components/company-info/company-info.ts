import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, required, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './company-info.html',
  styleUrl: './company-info.css',
})
export class CompanyInfo {
  readonly contactModel = signal({
    fullName: '',
    companyName: '',
    contact: ''
  });

  readonly contactForm = form(this.contactModel, (f) => {
    required(f.fullName);
    required(f.companyName);
    required(f.contact);
  });

  submitted = signal<boolean>(false);

  onSubmit(): void {
    if (this.contactForm().invalid()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    this.submitted.set(true);
    alert('¡Gracias por tu interés! Te contactaremos a la brevedad.');
    this.contactModel.set({ fullName: '', companyName: '', contact: '' });
  }
}
