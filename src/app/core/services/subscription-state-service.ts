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
import { firstValueFrom } from 'rxjs';

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
  readonly isCancelling = signal<boolean>(false);
  readonly isVerifying = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Computed signals
  readonly currentPlan = computed<SubscriptionPlan>(() => {
    const sub = this.currentSubscription();
    return sub?.plan || SubscriptionPlan.NONE;
  });

  readonly status = computed<SubscriptionStatus | null>(() => {
    return this.currentSubscription()?.status || null;
  });

  readonly isSubscribed = computed<boolean>(() => {
    const sub = this.currentSubscription();
    return (
      sub?.status === SubscriptionStatus.ACTIVE &&
      this.currentPlan() !== SubscriptionPlan.NONE
    );
  });

  readonly isActive = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.ACTIVE;
  });

  readonly isPending = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.PENDING;
  });

  readonly isPaymentFailed = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.PAYMENT_FAILED;
  });

  readonly isCancelled = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.CANCELLED;
  });

  readonly isExpired = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.EXPIRED;
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

  readonly nextBillingDateFormatted = computed<string | null>(() => {
    const dateStr = this.currentSubscription()?.nextBillingDate;
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  });

  readonly startDateFormatted = computed<string | null>(() => {
    const dateStr = this.currentSubscription()?.startDate;
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
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

  async verifySubscriptionUntilActive(maxAttempts = 6, delayMs = 1500): Promise<{ active: boolean; subscription: SubscriptionDetailDTO | null }> {
    this.isVerifying.set(true);
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const sub = await firstValueFrom(this.subscriptionService.getCurrentSubscription());
        if (sub) {
          this.currentSubscription.set(sub);
          if (sub.status === SubscriptionStatus.ACTIVE) {
            this.isVerifying.set(false);
            return { active: true, subscription: sub };
          }
        }
      } catch (e) {
        console.warn(`Attempt ${attempts} to verify subscription returned error or not found`, e);
      }

      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.isVerifying.set(false);
    const finalSub = this.currentSubscription();
    return { active: finalSub?.status === SubscriptionStatus.ACTIVE, subscription: finalSub };
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
    provider: PaymentProvider = PaymentProvider.MERCADO_PAGO,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY,
    companyId?: number
  ): Promise<{ success: boolean; data?: SubscriptionResponseDTO; error?: string }> {
    return this.subscribeWithMercadoPago(plan, billingPeriod, companyId);
  }

  subscribeWithMercadoPago(
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY,
    companyId?: number
  ): Promise<{ success: boolean; data?: SubscriptionResponseDTO; error?: string }> {
    this.isSubscribing.set(true);
    this.error.set(null);

    const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/subscription/callback` : '';

    const dto: SubscriptionRequestDTO = {
      plan,
      provider: PaymentProvider.MERCADO_PAGO,
      billingPeriod,
      returnUrl,
      companyId
    };

    return new Promise((resolve) => {
      this.subscriptionService.createSubscription(dto).subscribe({
        next: (res: SubscriptionResponseDTO) => {
          this.isSubscribing.set(false);
          // Redirigir inmediatamente al checkout de Mercado Pago
          if (res.checkoutUrl && typeof window !== 'undefined') {
            window.location.href = res.checkoutUrl;
          }
          resolve({ success: true, data: res });
        },
        error: (err) => {
          this.isSubscribing.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al iniciar la suscripción con Mercado Pago.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }

  cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    this.isCancelling.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      this.subscriptionService.cancelSubscription().subscribe({
        next: () => {
          const current = this.currentSubscription();
          if (current) {
            this.currentSubscription.set({
              ...current,
              status: SubscriptionStatus.CANCELLED,
              cancelledAt: new Date().toISOString()
            });
          }
          this.isCancelling.set(false);
          this.successMessage.set('Tu suscripción ha sido cancelada. Continuará activa hasta la fecha del próximo vencimiento.');
          resolve({ success: true });
        },
        error: (err) => {
          this.isCancelling.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al cancelar la suscripción.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }
}
