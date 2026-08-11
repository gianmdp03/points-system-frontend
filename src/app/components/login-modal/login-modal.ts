import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { AppConfigService } from '../../core/services/app-config-service';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  protected readonly configService = inject(AppConfigService);
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isSubmitted = signal<boolean>(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  closeModal(): void {
    this.authService.closeLoginModal();
    this.errorMessage.set(null);
    this.isSubmitted.set(false);
    this.loginForm.reset();
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(email, password);
    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
    } else {
      this.loginForm.reset();
      this.isSubmitted.set(false);
    }
  }
}
