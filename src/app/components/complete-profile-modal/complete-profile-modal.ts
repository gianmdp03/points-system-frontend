import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';

@Component({
  selector: 'app-complete-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile-modal.html'
})
export class CompleteProfileModalComponent {
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  readonly dniForm = this.fb.group({
    dni: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9]+$/)]]
  });

  readonly isSubmitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.isSubmitted.set(true);
    this.errorMessage.set(null);

    if (this.dniForm.invalid) {
      this.dniForm.markAllAsTouched();
      return;
    }

    const { dni } = this.dniForm.getRawValue();
    if (!dni) return;

    this.isLoading.set(true);
    const res = await this.authService.updateDni(dni);
    this.isLoading.set(false);

    if (!res.success) {
      this.errorMessage.set(res.error || 'No se pudo guardar el DNI. Intenta nuevamente.');
    }
  }
}
