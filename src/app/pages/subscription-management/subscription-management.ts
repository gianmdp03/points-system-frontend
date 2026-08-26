import { Component, OnInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import {
  BillingPeriod,
  PlanConfig,
  PLAN_CONFIGS,
  SubscriptionPlan,
  SubscriptionStatus,
  getSubscriptionStatusBadgeClass,
  getSubscriptionStatusLabel
} from '../../core/models';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionManagementPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly SubscriptionStatusEnum = SubscriptionStatus;
  readonly BillingPeriodEnum = BillingPeriod;
  readonly getSubscriptionStatusBadgeClass = getSubscriptionStatusBadgeClass;
  readonly getSubscriptionStatusLabel = getSubscriptionStatusLabel;

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly isPending = computed(() => this.subscriptionState.isPending());
  readonly pendingPlan = computed(() => this.subscriptionState.pendingPlan());
  readonly isPaymentFailed = computed(() => this.subscriptionState.isPaymentFailed());
  readonly currentPlanConfig = computed(() => this.subscriptionState.currentPlanConfig());
  readonly currentSub = computed(() => this.subscriptionState.currentSubscription());
  readonly status = computed(() => this.subscriptionState.status());
  readonly isSubscribed = computed(() => this.subscriptionState.isSubscribed());
  readonly isExpired = computed(() => this.subscriptionState.isExpired());
  readonly daysRemaining = computed(() => this.subscriptionState.daysRemaining());
  readonly planExpirationDateFormatted = computed(() => this.subscriptionState.planExpirationDateFormatted());
  readonly displayPlan = computed<SubscriptionPlan>(() => {
    if (this.isPending()) {
      return this.pendingPlan() || SubscriptionPlan.NONE;
    }
    return this.currentPlan();
  });
  readonly displayPlanConfig = computed(() => {
    return PLAN_CONFIGS[this.displayPlan()] || PLAN_CONFIGS[SubscriptionPlan.NONE];
  });

  getBillingPeriodLabel(period?: BillingPeriod | null): string {
    switch (period) {
      case BillingPeriod.MONTHLY: return '1 mes (30 días)';
      case BillingPeriod.QUARTERLY: return '3 meses (90 días)';
      case BillingPeriod.SEMIANNUAL: return '6 meses (180 días)';
      case BillingPeriod.YEARLY: return '12 meses (365 días)';
      default: return 'periodo';
    }
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.subscriptionState.loadSubscription();
    }
  }
}
