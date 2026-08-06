import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { Role } from '../../core/models';
import { isFieldInvalid, getFieldError } from '../../core/utils/form-utils';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isFieldInvalid = isFieldInvalid;
  readonly getFieldError = getFieldError;
  readonly RoleEnum = Role;

  activeTab = signal<'email' | 'magic'>('email');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isRegisterFormSubmitted = signal<boolean>(false);
  isMagicFormSubmitted = signal<boolean>(false);

  registerForm = this.fb.nonNullable.group({
    selectedRole: [Role.USER, [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  magicLinkForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  selectRole(role: Role): void {
    this.registerForm.patchValue({ selectedRole: role });
  }

  get selectedRole(): Role {
    return this.registerForm.get('selectedRole')?.value || Role.USER;
  }

  async onSubmit(): Promise<void> {
    this.isRegisterFormSubmitted.set(true);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password, name, dni, selectedRole } = this.registerForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.register(
      email,
      password,
      name,
      dni,
      selectedRole
    );

    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo a tu panel...');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } else {
      this.errorMessage.set(result.error || 'Error al registrar la cuenta.');
    }
  }

  async onOAuth(provider: 'google' | 'github'): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.loginWithOAuth(provider);
    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'No se pudo conectar con el proveedor.');
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

    const result = await this.authService.loginWithMagicLink(email);
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
