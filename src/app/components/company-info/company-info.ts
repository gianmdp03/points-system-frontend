import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-info.html',
  styleUrl: './company-info.css',
})
export class CompanyInfo {
  protected readonly configService = inject(AppConfigService);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  readonly isSubmitted = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);

  leadForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    companyName: ['', [Validators.required]],
    contactInfo: ['', [Validators.required]]
  });

  onSubmit(): void {
    this.isSubmitted.set(true);
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }
    this.isSuccess.set(true);
    this.leadForm.reset();
    this.isSubmitted.set(false);
  }
}
