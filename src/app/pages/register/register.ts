import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth-service';
import { Role } from '../../core/models';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormField],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly RoleEnum = Role;

  readonly registerModel = signal({
    selectedRole: Role.USER,
    name: '',
    dni: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  readonly registerForm = form(this.registerModel, (f) => {
    required(f.name);
    required(f.dni);
    required(f.email);
    email(f.email);
    required(f.password);
    minLength(f.password, 6);
    required(f.confirmPassword);
  });

  readonly magicModel = signal({ magicEmail: '' });
  readonly magicForm = form(this.magicModel, (f) => {
    required(f.magicEmail);
    email(f.magicEmail);
  });

  activeTab = signal<'email' | 'magic'>('email');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  selectRole(role: Role): void {
    this.registerModel.update(m => ({ ...m, selectedRole: role }));
  }

  get selectedRole(): Role {
    return this.registerModel().selectedRole;
  }

  async onSubmit(): Promise<void> {
    const val = this.registerModel();
    if (val.password !== val.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    if (!val.acceptTerms) {
      this.errorMessage.set('Debes aceptar los términos y condiciones.');
      return;
    }

    if (this.registerForm().invalid()) {
      this.errorMessage.set('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.register(
      val.email,
      val.password,
      val.name,
      val.dni,
      val.selectedRole
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
    if (this.magicForm().invalid()) {
      this.errorMessage.set('Por favor ingresa un correo válido.');
      return;
    }

    const { magicEmail } = this.magicModel();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.loginWithMagicLink(magicEmail);
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
