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

  readonly currentSubscription = signal<SubscriptionDetailDTO | null>(null);
  // Alias for backward compatibility
  readonly subscription = this.currentSubscription;

  readonly isLoading = signal<boolean>(false);
  readonly isSubscribing = signal<boolean>(false);
  readonly isUpgrading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Computed signals
  readonly currentPlan = computed<SubscriptionPlan>(() => {
    const sub = this.currentSubscription();
    return sub?.plan || SubscriptionPlan.NONE;
  });

  readonly isSubscribed = computed<boolean>(() => {
    const sub = this.currentSubscription();
    return (
      sub?.status === SubscriptionStatus.ACTIVE &&
      this.currentPlan() !== SubscriptionPlan.NONE
    );
  });

  readonly isFreeTrial = computed<boolean>(() => {
    return this.currentPlan() === SubscriptionPlan.FREE_TRIAL;
  });

  readonly isProOrEnterprise = computed<boolean>(() => {
    const plan = this.currentPlan();
    return plan === SubscriptionPlan.PRO || plan === SubscriptionPlan.ENTERPRISE || plan === SubscriptionPlan.FREE_TRIAL;
  });

  readonly currentPlanConfig = computed<PlanConfig>(() => {
    return PLAN_CONFIGS[this.currentPlan()] || PLAN_CONFIGS[SubscriptionPlan.NONE];
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

    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (sub: SubscriptionDetailDTO) => {
        this.currentSubscription.set(sub);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        // If not found (404), user has no active subscription (NONE)
        if (err.status === 404) {
          this.currentSubscription.set(null);
        } else {
          this.error.set(err.error?.message || 'Error al cargar la suscripción.');
        }
      }
    });
  }

  clearSubscription(): void {
    this.currentSubscription.set(null);
    this.error.set(null);
    this.successMessage.set(null);
  }

  changePlan(plan: SubscriptionPlan): Promise<{ success: boolean; data?: SubscriptionDetailDTO; error?: string }> {
    this.isUpgrading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    return new Promise((resolve) => {
      this.subscriptionService.changeSubscriptionPlan(plan).subscribe({
        next: (updatedSub: SubscriptionDetailDTO) => {
          this.currentSubscription.set(updatedSub);
          this.isUpgrading.set(false);
          const planName = PLAN_CONFIGS[plan]?.name || plan;
          this.successMessage.set(`¡Plan actualizado exitosamente a ${planName}!`);
          resolve({ success: true, data: updatedSub });
        },
        error: (err) => {
          this.isUpgrading.set(false);
          const errorMsg =
            err.error?.message ||
            (typeof err.error === 'string' ? err.error : null) ||
            err.message ||
            'Error al cambiar de plan.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }

  upgrade(plan: SubscriptionPlan): Promise<{ success: boolean; data?: SubscriptionDetailDTO; error?: string }> {
    return this.changePlan(plan);
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
          this.loadSubscription();
          // If checkoutUrl is provided, redirect
          if (res.checkoutUrl && typeof window !== 'undefined' && !res.checkoutUrl.includes('mock.local')) {
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
          this.currentSubscription.set(null);
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
