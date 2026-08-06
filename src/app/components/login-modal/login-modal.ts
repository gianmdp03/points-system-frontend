import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  protected readonly authService = inject(AuthService);

  email = signal<string>('');
  password = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  closeModal(): void {
    this.authService.closeLoginModal();
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.login(this.email(), this.password());
    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
    } else {
      this.email.set('');
      this.password.set('');
    }
  }
}
