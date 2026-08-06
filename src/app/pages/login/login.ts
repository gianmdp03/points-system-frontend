import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { form, required, email, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginModel = signal({ email: '', password: '' });
  readonly loginForm = form(this.loginModel, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);
  });

  readonly magicModel = signal({ magicEmail: '' });
  readonly magicForm = form(this.magicModel, (f) => {
    required(f.magicEmail);
    email(f.magicEmail);
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  activeTab = signal<'email' | 'magic'>('email');
  successMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.loginForm().invalid()) {
      this.errorMessage.set('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const { email: emailVal, password: passVal } = this.loginModel();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(emailVal, passVal);
    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
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
    this.successMessage.set(null);

    const result = await this.authService.loginWithMagicLink(magicEmail);
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
