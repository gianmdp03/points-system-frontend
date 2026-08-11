import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  protected readonly configService = inject(AppConfigService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  isDarkMode = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      this.isDarkMode.set(isDark);
    }
  }

  toggleDarkMode(): void {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
        this.isDarkMode.set(false);
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
        this.isDarkMode.set(true);
      }
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
