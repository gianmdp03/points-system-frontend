import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Dashboard } from '../../components/dashboard/dashboard';
import { AuthService } from '../../core/services/auth-service';
import { AppConfigService } from '../../core/services/app-config-service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Dashboard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
  protected readonly configService = inject(AppConfigService);
  protected readonly authService = inject(AuthService);
}
