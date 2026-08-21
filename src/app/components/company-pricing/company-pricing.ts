import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import {
  BillingPeriod,
  PLAN_CONFIGS,
  PlanConfig,
  SubscriptionPlan,
  SubscriptionStatus
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
  readonly BillingPeriodEnum = BillingPeriod;

  readonly billingPeriod = signal<BillingPeriod>(BillingPeriod.MONTHLY);
  readonly loadingPlan = signal<SubscriptionPlan | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly plansList: PlanConfig[] = [
    PLAN_CONFIGS[SubscriptionPlan.BASIC],
    PLAN_CONFIGS[SubscriptionPlan.PRO],
    PLAN_CONFIGS[SubscriptionPlan.ENTERPRISE]
  ];

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isSubscribed = computed(() => this.subscriptionState.isSubscribed());

  setBillingPeriod(period: BillingPeriod): void {
    this.billingPeriod.set(period);
  }

  getPlanPrice(config: PlanConfig): number {
    return this.billingPeriod() === BillingPeriod.YEARLY ? config.priceYearly : config.priceMonthly;
  }

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
    return this.currentPlan() === plan && this.isSubscribed();
  }

  isUpgrade(plan: SubscriptionPlan): boolean {
    if (!this.isSubscribed()) return false;
    const currentTier = this.getPlanTier(this.currentPlan());
    const targetTier = this.getPlanTier(plan);
    return targetTier > currentTier;
  }

  isDowngrade(plan: SubscriptionPlan): boolean {
    if (!this.isSubscribed()) return false;
    const currentTier = this.getPlanTier(this.currentPlan());
    const targetTier = this.getPlanTier(plan);
    return targetTier < currentTier;
  }

  async onSelectPlan(plan: SubscriptionPlan): Promise<void> {
    this.errorMessage.set(null);

    // If not logged in, prompt login or navigate to register
    if (!this.isLoggedIn()) {
      this.router.navigate(['/register'], {
        queryParams: { role: 'COMPANY_ADMIN', plan }
      });
      return;
    }

    // If already on this active plan, do nothing
    if (this.isCurrentPlan(plan)) {
      return;
    }

    this.loadingPlan.set(plan);

    try {
      if (this.isSubscribed()) {
        // If already has an active recurring subscription, change plan directly via PATCH
        const res = await this.subscriptionState.changePlan(plan);
        if (!res.success) {
          this.errorMessage.set(res.error || 'No se pudo procesar el cambio de plan.');
        }
      } else {
        // If has no active paid subscription (NONE, FREE_TRIAL, CANCELLED, EXPIRED), start Mercado Pago checkout
        const res = await this.subscriptionState.subscribeWithMercadoPago(plan, this.billingPeriod());
        if (!res.success) {
          this.errorMessage.set(res.error || 'No se pudo conectar con Mercado Pago.');
        }
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error inesperado al comunicarse con el servidor.');
    } finally {
      this.loadingPlan.set(null);
    }
  }
}
