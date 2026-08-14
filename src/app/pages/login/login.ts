import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { AppConfigService } from '../../core/services/app-config-service';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected readonly configService = inject(AppConfigService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  activeTab = signal<'email' | 'magic'>('email');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isLoginFormSubmitted = signal<boolean>(false);
  isMagicFormSubmitted = signal<boolean>(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  magicLinkForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit(): Promise<void> {
    this.isLoginFormSubmitted.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(email, password);
    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.loginWithOAuth('google');
    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'No se pudo conectar con Google.');
    }
  }

  async onMagicLink(): Promise<void> {
    this.isMagicFormSubmitted.set(true);
    if (this.magicLinkForm.invalid) {
      this.magicLinkForm.markAllAsTouched();
      return;
    }

    const { email } = this.magicLinkForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.loginWithMagicLink(email);
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
