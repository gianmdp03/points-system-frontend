import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SubscriptionStateService } from '../../core/services/subscription-state-service';
import { AuthService } from '../../core/services/auth-service';
import {
  BillingPeriod,
  PLAN_CONFIGS,
  SubscriptionPlan,
  SubscriptionStatus
} from '../../core/models';

@Component({
  selector: 'app-subscription-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-callback.html'
})
export class SubscriptionCallbackPage implements OnInit {
  protected readonly subscriptionState = inject(SubscriptionStateService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly SubscriptionStatusEnum = SubscriptionStatus;

  readonly isVerifying = signal<boolean>(true);
  readonly isSuccess = signal<boolean>(false);
  readonly verificationError = signal<string | null>(null);

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly planConfig = computed(() => this.subscriptionState.currentPlanConfig());
  readonly currentSub = computed(() => this.subscriptionState.currentSubscription());

  ngOnInit(): void {
    this.verifyPayment();
  }

  async verifyPayment(): Promise<void> {
    this.isVerifying.set(true);
    this.verificationError.set(null);

    // Initial check: if not logged in, prompt user
    if (!this.authService.isLoggedIn()) {
      this.isVerifying.set(false);
      this.verificationError.set('Debes iniciar sesión para verificar y asociar tu suscripción.');
      return;
    }

    try {
      const result = await this.subscriptionState.verifySubscriptionUntilActive(6, 1500);

      this.isVerifying.set(false);
      if (result.active) {
        this.isSuccess.set(true);
      } else {
        // Even if not active immediately, the webhook might arrive shortly
        this.isSuccess.set(result.subscription?.status === SubscriptionStatus.PENDING || result.subscription?.status === SubscriptionStatus.ACTIVE);
      }
    } catch (e: any) {
      this.isVerifying.set(false);
      this.verificationError.set(e?.message || 'Error al verificar el estado con el servidor.');
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToSubscription(): void {
    this.router.navigate(['/dashboard/subscription']);
  }
}
