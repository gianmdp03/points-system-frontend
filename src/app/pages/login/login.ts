import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = signal<string>('');
  password = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  magicEmail = signal<string>('');
  activeTab = signal<'email' | 'magic'>('email');
  successMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(this.email(), this.password());
    this.isLoading.set(false);

    if (result.success) {
      // Redirect to dashboard page on successful login
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
    if (!this.magicEmail()) {
      this.errorMessage.set('Por favor ingresa tu correo para enviarte el enlace mágico.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.loginWithMagicLink(this.magicEmail());
    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('¡Enlace mágico enviado! Revisa tu bandeja de entrada.');
    } else {
      this.errorMessage.set(result.error || 'No se pudo enviar el enlace mágico.');
    }
  }
}
