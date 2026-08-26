import { Component, computed, effect, inject, OnInit, signal, ChangeDetectionStrategy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import {
  BillingPeriod,
  PaymentProvider,
  PLAN_CONFIGS,
  PlanConfig,
  ProrationPreviewResponseDTO,
  SubscriptionPlan,
  SubscriptionStatus
} from '../../core/models';

@Component({
  selector: 'app-company-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-pricing.html',
  styleUrl: './company-pricing.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyPricing implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  private readonly router = inject(Router);

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly BillingPeriodEnum = BillingPeriod;

  // State for non-subscribed catalog duration selector
  readonly billingPeriod = signal<BillingPeriod>(BillingPeriod.MONTHLY);
  
  // State for subscribed user: recharge duration selector
  readonly rechargePeriod = signal<BillingPeriod>(BillingPeriod.MONTHLY);

  readonly loadingPlan = signal<SubscriptionPlan | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Proration previews cache map: plan -> ProrationPreviewResponseDTO
  readonly prorationPreviews = signal<Record<string, ProrationPreviewResponseDTO>>({});
  readonly loadingProrations = signal<boolean>(false);

  readonly plansList = computed(() => this.subscriptionState.plansList());
  readonly selectedCurrency = this.subscriptionState.selectedCurrency;

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly isPending = computed(() => this.subscriptionState.isPending());
  readonly pendingPlan = computed(() => this.subscriptionState.pendingPlan());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isSubscribed = computed(() => this.subscriptionState.isSubscribed());
  readonly daysRemaining = computed(() => this.subscriptionState.daysRemaining());
  readonly planExpirationDateFormatted = computed(() => this.subscriptionState.planExpirationDateFormatted());
  readonly currentSub = computed(() => this.subscriptionState.currentSubscription());
  readonly currentPlanConfig = computed(() => this.subscriptionState.currentPlanConfig());

  // Higher plans for upgrade section (strictly targetTier > currentTier)
  readonly higherPlans = computed(() => {
    return this.plansList().filter(p => this.isUpgrade(p.plan));
  });

  readonly hasHigherPlans = computed(() => this.higherPlans().length > 0);

  // Calculate projected new expiration date when adding selected recharge period
  readonly newExpirationDateFormatted = computed(() => {
    const sub = this.currentSub();
    const daysToAdd = this.getRechargeDays();
    let baseTime = Date.now();
    const expDateStr = sub?.planExpirationDate || sub?.nextBillingDate;
    if (expDateStr) {
      const parsed = new Date(expDateStr).getTime();
      if (!isNaN(parsed) && parsed > Date.now()) {
        baseTime = parsed;
      }
    }
    const newDate = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000);
    return newDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  private lastFetchedPlan: SubscriptionPlan | null = null;
  private isFetchingProrations = false;

  constructor() {
    effect(() => {
      const loggedIn = this.isLoggedIn();
      const subscribed = this.isSubscribed();
      const plan = this.currentPlan();

      if (loggedIn && subscribed && plan !== SubscriptionPlan.NONE) {
        untracked(() => {
          if (this.lastFetchedPlan !== plan && !this.isFetchingProrations) {
            this.lastFetchedPlan = plan;
            this.loadProrations();
          }
        });
      } else {
        untracked(() => {
          if (this.lastFetchedPlan !== null) {
            this.lastFetchedPlan = null;
            this.prorationPreviews.set({});
          }
        });
      }
    });
  }

  ngOnInit(): void {
    // Relies on constructor effect with deduplication
  }

  setBillingPeriod(period: BillingPeriod): void {
    this.billingPeriod.set(period);
  }

  setRechargePeriod(period: BillingPeriod): void {
    this.rechargePeriod.set(period);
  }

  setCurrency(currency: 'ARS' | 'USD'): void {
    this.subscriptionState.setSelectedCurrency(currency);
  }

  getPlanPrice(config: PlanConfig, period = this.billingPeriod()): number {
    const isUsd = this.selectedCurrency() === 'USD';

    if (isUsd) {
      switch (period) {
        case BillingPeriod.MONTHLY:
          return config.priceMonthlyUsd || 0;
        case BillingPeriod.QUARTERLY:
          return config.priceQuarterlyUsd || (config.priceMonthlyUsd ? config.priceMonthlyUsd * 3 : 0);
        case BillingPeriod.SEMIANNUAL:
          return config.priceSemiannualUsd || (config.priceMonthlyUsd ? config.priceMonthlyUsd * 6 : 0);
        case BillingPeriod.YEARLY:
          return config.priceYearlyUsd || (config.priceMonthlyUsd ? config.priceMonthlyUsd * 10 : 0);
      }
    }

    switch (period) {
      case BillingPeriod.MONTHLY:
        return config.priceMonthlyArs || config.priceMonthly || 0;
      case BillingPeriod.QUARTERLY:
        return config.priceQuarterlyArs || config.priceQuarterly || (config.priceMonthlyArs ? config.priceMonthlyArs * 3 : 0);
      case BillingPeriod.SEMIANNUAL:
        return config.priceSemiannualArs || config.priceSemiannual || (config.priceMonthlyArs ? config.priceMonthlyArs * 6 : 0);
      case BillingPeriod.YEARLY:
        return config.priceYearlyArs || config.priceYearly || 0;
    }
  }

  getBillingPeriodLabel(period = this.billingPeriod()): string {
    switch (period) {
      case BillingPeriod.MONTHLY: return 'mes (+30 días)';
      case BillingPeriod.QUARTERLY: return '3 meses (+90 días)';
      case BillingPeriod.SEMIANNUAL: return '6 meses (+180 días)';
      case BillingPeriod.YEARLY: return 'año (+365 días)';
    }
  }

  getDiscountPercentage(period: BillingPeriod, config?: PlanConfig): number {
    const targetConfig = config || (this.isSubscribed() ? this.currentPlanConfig() : (this.plansList().find(p => p.isPopular) || this.plansList()[0]));
    if (!targetConfig) return 0;

    const monthlyPrice = this.getPlanPrice(targetConfig, BillingPeriod.MONTHLY);
    if (monthlyPrice <= 0) return 0;

    let multiplier = 1;
    switch (period) {
      case BillingPeriod.MONTHLY: multiplier = 1; break;
      case BillingPeriod.QUARTERLY: multiplier = 3; break;
      case BillingPeriod.SEMIANNUAL: multiplier = 6; break;
      case BillingPeriod.YEARLY: multiplier = 12; break;
    }

    if (multiplier === 1) return 0;

    const periodPrice = this.getPlanPrice(targetConfig, period);
    const fullExpectedPrice = monthlyPrice * multiplier;

    if (periodPrice >= fullExpectedPrice || fullExpectedPrice <= 0) return 0;

    const discount = ((fullExpectedPrice - periodPrice) / fullExpectedPrice) * 100;
    return Math.round(discount);
  }

  getBillingPeriodDaysLabel(period = this.billingPeriod()): string {
    switch (period) {
      case BillingPeriod.MONTHLY: return '30 días';
      case BillingPeriod.QUARTERLY: return '90 días';
      case BillingPeriod.SEMIANNUAL: return '180 días';
      case BillingPeriod.YEARLY: return '365 días';
    }
  }

  getRechargeDays(period = this.rechargePeriod()): number {
    switch (period) {
      case BillingPeriod.MONTHLY: return 30;
      case BillingPeriod.QUARTERLY: return 90;
      case BillingPeriod.SEMIANNUAL: return 180;
      case BillingPeriod.YEARLY: return 365;
    }
  }

  getRechargePrice(period = this.rechargePeriod()): number {
    return this.getPlanPrice(this.currentPlanConfig(), period);
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

  isPlanPending(plan: SubscriptionPlan): boolean {
    return this.isPending() && this.pendingPlan() === plan;
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

  getProrationPrice(targetPlan: SubscriptionPlan): number {
    const preview = this.prorationPreviews()[targetPlan];
    if (preview && preview.proratedUpgradeAmount !== undefined && preview.proratedUpgradeAmount !== null) {
      return preview.proratedUpgradeAmount;
    }
    // Instant fallback calculation
    const currentConfig = this.currentPlanConfig();
    const targetConfig = PLAN_CONFIGS[targetPlan];
    if (!currentConfig || !targetConfig) return 0;

    const currentPrice = currentConfig.priceMonthlyArs || currentConfig.priceMonthly || 0;
    const targetPrice = targetConfig.priceMonthlyArs || targetConfig.priceMonthly || 0;
    const days = this.daysRemaining();
    if (days <= 0) return targetPrice;

    const dailyDiff = Math.max(0, (targetPrice - currentPrice) / 30);
    return Math.round(dailyDiff * days);
  }

  getProrationDailyDiff(targetPlan: SubscriptionPlan): number {
    const preview = this.prorationPreviews()[targetPlan];
    if (preview && preview.newDailyRate !== undefined && preview.currentDailyRate !== undefined) {
      return Math.max(0, preview.newDailyRate - preview.currentDailyRate);
    }
    const currentConfig = this.currentPlanConfig();
    const targetConfig = PLAN_CONFIGS[targetPlan];
    if (!currentConfig || !targetConfig) return 0;
    const currentPrice = currentConfig.priceMonthlyArs || currentConfig.priceMonthly || 0;
    const targetPrice = targetConfig.priceMonthlyArs || targetConfig.priceMonthly || 0;
    return Math.max(0, (targetPrice - currentPrice) / 30);
  }

  async loadProrations(): Promise<void> {
    if (!this.isLoggedIn() || !this.isSubscribed() || this.isFetchingProrations) return;
    const higher = this.higherPlans();
    if (higher.length === 0) return;

    this.isFetchingProrations = true;
    this.loadingProrations.set(true);

    try {
      const updatedMap: Record<string, ProrationPreviewResponseDTO> = {};
      for (const p of higher) {
        try {
          const preview = await this.subscriptionState.getProrationPreview(p.plan);
          if (preview) {
            updatedMap[p.plan] = preview;
          }
        } catch (e) {
          console.warn(`[CompanyPricing] No se pudo cargar preview de prorrateo para ${p.plan}:`, e);
        }
      }
      this.prorationPreviews.set(updatedMap);
    } finally {
      this.isFetchingProrations = false;
      this.loadingProrations.set(false);
    }
  }

  /**
   * Action for Subscribed User: Recharge days for the CURRENT plan
   */
  async onRechargeCurrentPlan(): Promise<void> {
    this.errorMessage.set(null);
    const plan = this.currentPlan();
    const period = this.rechargePeriod();

    this.loadingPlan.set(plan);

    try {
      const res = await this.subscriptionState.subscribe(plan, period);
      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else if (!res.success) {
        this.errorMessage.set(res.error || 'No se pudo iniciar la recarga en Mercado Pago.');
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error al preparar la pasarela de pago para la recarga.');
    } finally {
      this.loadingPlan.set(null);
    }
  }

  /**
   * Action for Subscribed User: Upgrade to a HIGHER plan with prorated price for remaining days
   */
  async onUpgradePlan(targetPlan: SubscriptionPlan): Promise<void> {
    this.errorMessage.set(null);
    this.loadingPlan.set(targetPlan);

    try {
      const res = await this.subscriptionState.upgrade(targetPlan);
      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else if (!res.success) {
        this.errorMessage.set(res.error || 'No se pudo iniciar el cobro de Upgrade en Mercado Pago.');
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error al preparar el checkout del Upgrade.');
    } finally {
      this.loadingPlan.set(null);
    }
  }

  /**
   * Action for Non-Subscribed User: Initial subscription purchase
   */
  async onSelectPlan(plan: SubscriptionPlan): Promise<void> {
    this.errorMessage.set(null);

    // If not logged in, prompt login or navigate to register
    if (!this.isLoggedIn()) {
      this.router.navigate(['/register'], {
        queryParams: { role: 'COMPANY_ADMIN', plan }
      });
      return;
    }

    this.loadingPlan.set(plan);

    try {
      const res = await this.subscriptionState.subscribe(plan, this.billingPeriod());
      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else if (!res.success) {
        this.errorMessage.set(res.error || 'No se pudo iniciar Checkout Pro de Mercado Pago.');
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Error al preparar la pasarela de pago.');
    } finally {
      this.loadingPlan.set(null);
    }
  }
}
