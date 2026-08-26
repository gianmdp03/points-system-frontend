import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class Login implements OnInit {
  protected readonly configService = inject(AppConfigService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isLoginFormSubmitted = signal<boolean>(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['registered'] === 'true' || params['confirmEmail'] === 'true') {
      const email = params['email'] || '';
      const emailText = email ? ` (${email})` : '';
      this.successMessage.set(
        `¡Registro exitoso! Te hemos enviado un correo de confirmación a tu e-mail${emailText}. Por favor revisa tu bandeja de entrada (y la carpeta de spam) y confirma tu cuenta antes de iniciar sesión.`
      );
      if (email) {
        this.loginForm.patchValue({ email });
      }
    } else if (params['reason'] === 'auth_required' || params['redirectReason'] === 'auth_required') {
      this.errorMessage.set('Debes iniciar sesión para acceder a esta sección.');
    }
  }

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
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      this.router.navigateByUrl(returnUrl);
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
}
