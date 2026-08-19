import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import {
  BillingPeriod,
  PaymentProvider,
  PLAN_CONFIGS,
  PlanConfig,
  SubscriptionPlan
} from '../../core/models';

@Component({
  selector: 'app-company-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-pricing.html',
  styleUrl: './company-pricing.css',
})
export class CompanyPricing {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  private readonly router = inject(Router);

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly plansList: PlanConfig[] = [
    PLAN_CONFIGS[SubscriptionPlan.BASIC],
    PLAN_CONFIGS[SubscriptionPlan.PRO],
    PLAN_CONFIGS[SubscriptionPlan.ENTERPRISE]
  ];

  readonly loadingPlan = signal<SubscriptionPlan | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  async onSelectPlan(plan: SubscriptionPlan): Promise<void> {
    this.errorMessage.set(null);

    // If not logged in, prompt login modal or register
    if (!this.isLoggedIn()) {
      this.authService.openLoginModal();
      return;
    }

    // If already on this active plan, nothing to do or inform user
    if (this.currentPlan() === plan && this.subscriptionState.isSubscribed()) {
      return;
    }

    this.loadingPlan.set(plan);

    try {
      const res = await this.subscriptionState.subscribe(
        plan,
        PaymentProvider.MOCK,
        BillingPeriod.MONTHLY
      );

      if (!res.success) {
        this.errorMessage.set(res.error || 'No se pudo procesar la suscripción. Intenta nuevamente.');
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error inesperado al comunicarse con el servidor.');
    } finally {
      this.loadingPlan.set(null);
    }
  }
}
