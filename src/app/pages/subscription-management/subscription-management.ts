import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import {
  BillingPeriod,
  PLAN_CONFIGS,
  PlanConfig,
  SubscriptionDetailDTO,
  SubscriptionPlan,
  SubscriptionStatus,
  getSubscriptionStatusBadgeClass,
  getSubscriptionStatusLabel
} from '../../core/models';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-management.html'
})
export class SubscriptionManagementPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  private readonly router = inject(Router);

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly SubscriptionStatusEnum = SubscriptionStatus;
  readonly BillingPeriodEnum = BillingPeriod;
  readonly getSubscriptionStatusBadgeClass = getSubscriptionStatusBadgeClass;
  readonly getSubscriptionStatusLabel = getSubscriptionStatusLabel;

  // Modals state
  readonly showChangePlanModal = signal<boolean>(false);
  readonly showCancelModal = signal<boolean>(false);
  readonly selectedPlanForChange = signal<SubscriptionPlan | null>(null);
  readonly modalError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly availablePlans = computed(() => this.subscriptionState.plansList());

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly currentPlanConfig = computed(() => this.subscriptionState.currentPlanConfig());
  readonly currentSub = computed(() => this.subscriptionState.currentSubscription());
  readonly status = computed(() => this.subscriptionState.status());
  readonly isSubscribed = computed(() => this.subscriptionState.isSubscribed());
  readonly isCancelled = computed(() => this.subscriptionState.isCancelled());

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.subscriptionState.loadSubscription();
    }
  }

  openChangePlanModal(): void {
    this.modalError.set(null);
    this.selectedPlanForChange.set(null);
    this.showChangePlanModal.set(true);
  }

  closeChangePlanModal(): void {
    this.showChangePlanModal.set(false);
    this.modalError.set(null);
  }

  selectPlanToChange(plan: SubscriptionPlan): void {
    if (plan !== this.currentPlan()) {
      this.selectedPlanForChange.set(plan);
    }
  }

  async confirmPlanChange(): Promise<void> {
    const targetPlan = this.selectedPlanForChange();
    if (!targetPlan || targetPlan === this.currentPlan()) return;

    this.isSubmitting.set(true);
    this.modalError.set(null);

    try {
      if (this.isSubscribed()) {
        const res = await this.subscriptionState.changePlan(targetPlan);
        if (res.success) {
          this.closeChangePlanModal();
        } else {
          this.modalError.set(res.error || 'No se pudo actualizar el plan.');
        }
      } else {
        // If not subscribed with MP, redirect to MP checkout
        const res = await this.subscriptionState.subscribeWithMercadoPago(targetPlan, BillingPeriod.MONTHLY);
        if (!res.success) {
          this.modalError.set(res.error || 'No se pudo conectar con Mercado Pago.');
        }
      }
    } catch (e: any) {
      this.modalError.set(e?.message || 'Error inesperado al cambiar de plan.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openCancelModal(): void {
    this.modalError.set(null);
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.modalError.set(null);
  }

  async confirmCancelSubscription(): Promise<void> {
    this.isSubmitting.set(true);
    this.modalError.set(null);

    try {
      const res = await this.subscriptionState.cancelSubscription();
      if (res.success) {
        this.closeCancelModal();
      } else {
        this.modalError.set(res.error || 'No se pudo cancelar la suscripción.');
      }
    } catch (e: any) {
      this.modalError.set(e?.message || 'Error inesperado al procesar la cancelación.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
