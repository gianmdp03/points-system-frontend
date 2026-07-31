import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { Role } from '../../core/models';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly RoleEnum = Role;

  // Form Signals
  selectedRole = signal<Role>(Role.USER);
  name = signal<string>('');
  dni = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  acceptTerms = signal<boolean>(false);

  // Magic Link Signal
  magicEmail = signal<string>('');
  activeTab = signal<'email' | 'magic'>('email');

  // UI state
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  selectRole(role: Role): void {
    this.selectedRole.set(role);
  }

  async onSubmit(): Promise<void> {
    if (!this.name() || !this.dni() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    if (!this.acceptTerms()) {
      this.errorMessage.set('Debes aceptar los términos y condiciones.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.register(
      this.email(),
      this.password(),
      this.name(),
      this.dni(),
      this.selectedRole()
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
    if (!this.magicEmail()) {
      this.errorMessage.set('Por favor ingresa tu correo para enviarte el enlace mágico.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.loginWithMagicLink(this.magicEmail());
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
