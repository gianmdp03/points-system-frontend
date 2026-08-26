import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  BillingPeriod,
  PLAN_CONFIGS,
  PlanConfig,
  PaymentProvider,
  ProrationPreviewResponseDTO,
  SubscriptionDetailDTO,
  SubscriptionPlan,
  SubscriptionRequestDTO,
  SubscriptionResponseDTO,
  SubscriptionStatus,
  SubscriptionUpgradeRequestDTO
} from '../models';
import { SubscriptionService } from './subscription-service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionStateService {
  private readonly subscriptionService = inject(SubscriptionService);

  readonly currentSubscription = signal<SubscriptionDetailDTO | null>(null);
  readonly subscription = this.currentSubscription;

  readonly isLoading = signal<boolean>(false);
  readonly isSubscribing = signal<boolean>(false);
  readonly isUpgrading = signal<boolean>(false);
  readonly isVerifying = signal<boolean>(false);

  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly selectedCurrency = signal<'ARS' | 'USD'>('ARS');
  readonly plansList = signal<PlanConfig[]>(Object.values(PLAN_CONFIGS).filter(p => !p.isHidden));

  readonly isPending = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.PENDING;
  });

  readonly isPaymentFailed = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.PAYMENT_FAILED;
  });

  readonly isExpired = computed<boolean>(() => {
    return this.currentSubscription()?.status === SubscriptionStatus.EXPIRED;
  });

  readonly daysRemaining = computed<number>(() => {
    const sub = this.currentSubscription();
    if (!sub) return 0;
    if (sub.daysRemaining !== undefined && sub.daysRemaining !== null) {
      return Math.max(0, sub.daysRemaining);
    }
    const expDate = sub.planExpirationDate || sub.nextBillingDate;
    if (expDate) {
      try {
        const diff = Math.ceil((new Date(expDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
      } catch {
        return 0;
      }
    }
    return 0;
  });

  readonly isSubscribed = computed<boolean>(() => {
    const status = this.currentSubscription()?.status;
    const plan = this.currentSubscription()?.plan;
    if (!status || !plan || plan === SubscriptionPlan.NONE) return false;
    return status === SubscriptionStatus.APPROVED || (status as string) === 'ACTIVE';
  });

  readonly currentPlan = computed<SubscriptionPlan>(() => {
    const sub = this.currentSubscription();
    if (!sub) return SubscriptionPlan.NONE;
    if (sub.status === SubscriptionStatus.APPROVED || (sub.status as string) === 'ACTIVE') {
      return sub.plan;
    }
    return SubscriptionPlan.NONE;
  });

  readonly pendingPlan = computed<SubscriptionPlan | null>(() => {
    if (this.isPending()) {
      return this.currentSubscription()?.plan || null;
    }
    return null;
  });

  readonly status = computed<SubscriptionStatus | null>(() => {
    return this.currentSubscription()?.status || null;
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

  readonly planExpirationDateFormatted = computed<string | null>(() => {
    const dateStr = this.currentSubscription()?.planExpirationDate || this.currentSubscription()?.nextBillingDate;
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

  readonly nextBillingDateFormatted = this.planExpirationDateFormatted;

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

  loadPlans(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (apiPlans) => {
        if (apiPlans && apiPlans.length > 0) {
          const mapped: PlanConfig[] = apiPlans.map((p) => {
            const fallback = PLAN_CONFIGS[p.plan] || ({} as Partial<PlanConfig>);
            const rawFeatures = p.features && p.features.length > 0 ? p.features : (fallback.features || []);
            return {
              plan: p.plan,
              name: this.fixUtf8(p.name) || fallback.name || p.plan,
              tagline: this.fixUtf8(p.tagline) || fallback.tagline || '',
              priceMonthly: p.priceMonthlyArs || p.priceMonthly || fallback.priceMonthly || 0,
              priceQuarterly: p.priceQuarterlyArs || p.priceQuarterly || fallback.priceQuarterly || 0,
              priceSemiannual: p.priceSemiannualArs || p.priceSemiannual || fallback.priceSemiannual || 0,
              priceYearly: p.priceYearlyArs || p.priceYearly || fallback.priceYearly || 0,
              priceMonthlyArs: p.priceMonthlyArs || fallback.priceMonthlyArs || 0,
              priceQuarterlyArs: p.priceQuarterlyArs || fallback.priceQuarterlyArs || 0,
              priceSemiannualArs: p.priceSemiannualArs || fallback.priceSemiannualArs || 0,
              priceYearlyArs: p.priceYearlyArs || fallback.priceYearlyArs || 0,
              priceMonthlyUsd: p.priceMonthlyUsd || fallback.priceMonthlyUsd || 0,
              priceQuarterlyUsd: p.priceQuarterlyUsd || fallback.priceQuarterlyUsd || 0,
              priceSemiannualUsd: p.priceSemiannualUsd || fallback.priceSemiannualUsd || 0,
              priceYearlyUsd: p.priceYearlyUsd || fallback.priceYearlyUsd || 0,
              currency: p.currency || fallback.currency || 'ARS',
              maxClients: p.maxClients !== undefined ? p.maxClients : (fallback.maxClients ?? -1),
              maxRewards: p.maxRewards !== undefined ? p.maxRewards : (fallback.maxRewards ?? -1),
              maxCompanies: p.maxCompanies !== undefined ? p.maxCompanies : (fallback.maxCompanies ?? -1),
              canCreatePromotions: p.canCreatePromotions !== undefined ? p.canCreatePromotions : (fallback.canCreatePromotions ?? false),
              isPopular: p.isPopular !== undefined ? p.isPopular : (fallback.isPopular ?? false),
              isHidden: fallback.isHidden || false,
              features: rawFeatures.map(f => this.fixUtf8(f))
            };
          }).filter(p => !p.isHidden);

          this.plansList.set(mapped);
        }
      },
      error: (err) => {
        console.warn('[SubscriptionStateService] Fallback to static plan configs:', err.message || err);
      }
    });
  }

  private fixUtf8(str?: string): string {
    if (!str) return '';
    try {
      if (/[\u00C0-\u00FF]/.test(str)) {
        return decodeURIComponent(escape(str));
      }
    } catch {
      // Return raw string if decoding fails
    }
    return str;
  }

  setSelectedCurrency(currency: 'ARS' | 'USD'): void {
    this.selectedCurrency.set(currency);
  }

  clearSubscription(): void {
    this.currentSubscription.set(null);
    this.error.set(null);
    this.successMessage.set(null);
  }

  loadSubscription(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        this.currentSubscription.set(subscription);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status !== 404 && err.status !== 401) {
          this.error.set(err.error?.message || err.message || 'Error al cargar la suscripción.');
        }
      }
    });
  }

  async verifySubscriptionUntilActive(
    maxAttempts = 8,
    delayMs = 2000
  ): Promise<{ active: boolean; subscription: SubscriptionDetailDTO | null }> {
    this.isVerifying.set(true);
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const sub = await firstValueFrom(this.subscriptionService.getCurrentSubscription());
        if (sub) {
          this.currentSubscription.set(sub);
          const isApproved = sub.status === SubscriptionStatus.APPROVED || (sub.status as string) === 'ACTIVE';
          if (isApproved && sub.plan !== SubscriptionPlan.FREE_TRIAL) {
            this.isVerifying.set(false);
            return { active: true, subscription: sub };
          }
        }
      } catch (e) {
        console.warn(`Attempt ${attempts} to verify subscription status:`, e);
      }

      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.isVerifying.set(false);
    const finalSub = this.currentSubscription();
    const finalApproved = finalSub?.status === SubscriptionStatus.APPROVED || (finalSub?.status as string) === 'ACTIVE';
    return {
      active: !!(finalApproved && finalSub?.plan !== SubscriptionPlan.FREE_TRIAL),
      subscription: finalSub
    };
  }

  getProrationPreview(newPlan: SubscriptionPlan): Promise<ProrationPreviewResponseDTO> {
    return firstValueFrom(this.subscriptionService.getProrationPreview(newPlan));
  }

  subscribe(
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod
  ): Promise<{ success: boolean; data?: SubscriptionResponseDTO; error?: string }> {
    this.isSubscribing.set(true);
    this.error.set(null);

    const dto: SubscriptionRequestDTO = {
      plan,
      provider: PaymentProvider.MERCADO_PAGO,
      billingPeriod
    };

    return new Promise((resolve) => {
      this.subscriptionService.createSubscription(dto).subscribe({
        next: (res: SubscriptionResponseDTO) => {
          this.isSubscribing.set(false);
          resolve({ success: true, data: res });
        },
        error: (err) => {
          this.isSubscribing.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al iniciar el pago con Mercado Pago.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }

  upgrade(
    newPlan: SubscriptionPlan
  ): Promise<{ success: boolean; data?: SubscriptionResponseDTO; error?: string }> {
    this.isUpgrading.set(true);
    this.error.set(null);

    const dto: SubscriptionUpgradeRequestDTO = {
      newPlan
    };

    return new Promise((resolve) => {
      this.subscriptionService.upgradeSubscription(dto).subscribe({
        next: (res: SubscriptionResponseDTO) => {
          this.isUpgrading.set(false);
          resolve({ success: true, data: res });
        },
        error: (err) => {
          this.isUpgrading.set(false);
          const errorMsg = err.error?.message || err.message || 'Error al iniciar el cobro del Upgrade.';
          this.error.set(errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });
    });
  }
}
