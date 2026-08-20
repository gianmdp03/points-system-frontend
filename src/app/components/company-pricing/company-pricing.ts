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

  getPlanTier(plan: SubscriptionPlan): number {
    switch (plan) {
      case SubscriptionPlan.NONE: return 0;
      case SubscriptionPlan.FREE_TRIAL: return 1;
      case SubscriptionPlan.BASIC: return 2;
      case SubscriptionPlan.PRO: return 3;
      case SubscriptionPlan.ENTERPRISE: return 4;
      default: return 0;
    }
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    return this.currentPlan() === plan && this.subscriptionState.isSubscribed();
  }

  isUpgrade(plan: SubscriptionPlan): boolean {
    const currentTier = this.getPlanTier(this.currentPlan());
    const targetTier = this.getPlanTier(plan);
    return targetTier > currentTier;
  }

  isDowngrade(plan: SubscriptionPlan): boolean {
    const currentTier = this.getPlanTier(this.currentPlan());
    const targetTier = this.getPlanTier(plan);
    return targetTier < currentTier && this.currentPlan() !== SubscriptionPlan.NONE && this.currentPlan() !== SubscriptionPlan.FREE_TRIAL;
  }

  async onSelectPlan(plan: SubscriptionPlan): Promise<void> {
    this.errorMessage.set(null);

    // If not logged in, prompt login modal
    if (!this.isLoggedIn()) {
      this.authService.openLoginModal();
      return;
    }

    // If already on this active plan, do nothing
    if (this.isCurrentPlan(plan)) {
      return;
    }

    this.loadingPlan.set(plan);

    try {
      // Both upgrades, downgrades, and free trial transitions go through changePlan
      const res = await this.subscriptionState.changePlan(plan);
      if (!res.success) {
        this.errorMessage.set(res.error || 'No se pudo procesar el cambio de plan.');
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error inesperado al comunicarse con el servidor.');
    } finally {
      this.loadingPlan.set(null);
    }
  }
}
