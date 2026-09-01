import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PromotionListDTO, Role, SubscriptionPlan } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth-service';
import { SubscriptionStateService } from '../../../../core/services/subscription-state-service';
import { PlanLimitModalService } from '../../../../core/services/plan-limit-modal-service';

@Component({
  selector: 'app-tab-promotions',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './tab-promotions.html',
  host: { class: 'block' }
})
export class TabPromotionsComponent {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  protected readonly planLimitModalService = inject(PlanLimitModalService);

  @Input() promotions: PromotionListDTO[] = [];
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addPromotion = new EventEmitter<void>();
  @Output() editPromotion = new EventEmitter<PromotionListDTO>();

  readonly RoleEnum = Role;
  readonly SubscriptionPlanEnum = SubscriptionPlan;

  readonly canCreatePromotions = computed(() => {
    // APP_ADMIN can always create promotions or if the company admin plan allows it
    if (this.currentRole === Role.APP_ADMIN) return true;
    return this.subscriptionState.canCreatePromotions();
  });

  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());

  onAddPromotionClick(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    if (!this.canCreatePromotions()) {
      const isNone = this.currentPlan() === SubscriptionPlan.NONE;
      this.planLimitModalService.open({
        title: isNone ? 'Sin Plan Activo' : 'Promociones no disponibles en Plan BASIC',
        message: isNone 
          ? 'No posees un plan de suscripción activo ni periodo de prueba. Suscríbete a PRO o ENTERPRISE para crear campañas de promociones y multiplicar puntos.'
          : 'Tu plan BASIC no incluye la creación de campañas promocionales. Actualiza al Plan PRO o ENTERPRISE para multiplicar los puntos y fidelizar a tus clientes.',
        targetPlan: SubscriptionPlan.PRO,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }
    this.addPromotion.emit();
  }
}
