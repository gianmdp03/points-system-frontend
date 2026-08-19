import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PromotionListDTO, Role, SubscriptionPlan } from '../../../../core/models';
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
    if (!this.canCreatePromotions()) {
      this.planLimitModalService.open({
        title: 'Promociones no disponibles en Plan BASIC',
        message: 'Tu plan BASIC no incluye la creación de campañas promocionales. Actualiza al Plan PRO o ENTERPRISE para multiplicar los puntos y fidelizar a tus clientes.',
        targetPlan: SubscriptionPlan.PRO,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }
    this.addPromotion.emit();
  }
}
