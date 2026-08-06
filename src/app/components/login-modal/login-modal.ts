import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, required, email, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  protected readonly authService = inject(AuthService);

  readonly loginModel = signal({ email: '', password: '' });
  readonly loginForm = form(this.loginModel, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  closeModal(): void {
    this.authService.closeLoginModal();
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm().invalid()) {
      this.errorMessage.set('Por favor completa todos los campos requeridos.');
      return;
    }

    const { email: emailVal, password: passVal } = this.loginModel();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(emailVal, passVal);
    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
    } else {
      this.loginModel.set({ email: '', password: '' });
    }
  }
}
