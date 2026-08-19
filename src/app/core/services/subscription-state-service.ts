import { computed, inject, Injectable, signal } from '@angular/core';
import {
  BillingPeriod,
  PaymentProvider,
  PLAN_CONFIGS,
  PlanConfig,
  SubscriptionDetailDTO,
  SubscriptionPlan,
  SubscriptionRequestDTO,
  SubscriptionResponseDTO,
  SubscriptionStatus
} from '../models';
import { SubscriptionService } from './subscription-service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionStateService {
  private readonly subscriptionService = inject(SubscriptionService);

  readonly subscription = signal<SubscriptionDetailDTO | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSubscribing = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly currentPlan = computed<SubscriptionPlan>(() => {
    const sub = this.subscription();
    return sub?.plan || SubscriptionPlan.BASIC;
  });

  readonly isSubscribed = computed<boolean>(() => {
    const sub = this.subscription();
    return sub?.status === SubscriptionStatus.ACTIVE;
  });

  readonly currentPlanConfig = computed<PlanConfig>(() => {
    return PLAN_CONFIGS[this.currentPlan()];
  });

  readonly canCreatePromotions = computed<boolean>(() => {
    return this.currentPlanConfig().canCreatePromotions;
  });

  readonly maxClients = computed<number>(() => {
    return this.currentPlanConfig().maxClients;
  });

  readonly maxRewards = computed<number>(() => {
    return this.currentPlanConfig().maxRewards;
  });

  readonly maxCompanies = computed<number>(() => {
    return this.currentPlanConfig().maxCompanies;
  });

  loadSubscription(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscriptionService.getMySubscription().subscribe({
      next: (sub: SubscriptionDetailDTO) => {
        this.subscription.set(sub);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        // If not found (404), user doesn't have an active custom subscription yet, keep BASIC
        if (err.status === 404) {
          this.subscription.set(null);
        } else {
          this.error.set(err.error?.message || 'Error al cargar la suscripción.');
        }
      }
    });
  }

  clearSubscription(): void {
    this.subscription.set(null);
    this.error.set(null);
  }

  subscribe(
    plan: SubscriptionPlan,
    provider: PaymentProvider = PaymentProvider.MOCK,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY
  ): Promise<{ success: boolean; data?: SubscriptionResponseDTO; error?: string }> {
    this.isSubscribing.set(true);
    this.error.set(null);

    const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '';

    const dto: SubscriptionRequestDTO = {
      plan,
      provider,
      billingPeriod,
      returnUrl
    };

    return new Promise((resolve) => {
      this.subscriptionService.createSubscription(dto).subscribe({
        next: (res: SubscriptionResponseDTO) => {
          this.isSubscribing.set(false);
          // If checkoutUrl is provided, redirect
          if (res.checkoutUrl && typeof window !== 'undefined') {
            window.location.href = res.checkoutUrl;
          }
          resolve({ success: true, data: res });
        },
        error: (err) => {
          this.isSubscribing.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al procesar la suscripción.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }

  cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    return new Promise((resolve) => {
      this.subscriptionService.cancelSubscription().subscribe({
        next: () => {
          this.subscription.set(null);
          this.isLoading.set(false);
          resolve({ success: true });
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al cancelar la suscripción.';
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }
}
