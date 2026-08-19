import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyPricing } from '../../components/company-pricing/company-pricing';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CompanyPricing],
  templateUrl: './pricing-page.html'
})
export class PricingPage {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
}
