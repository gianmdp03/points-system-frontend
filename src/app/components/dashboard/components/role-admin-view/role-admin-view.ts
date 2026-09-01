import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyListDTO, SubscriptionPlan } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth-service';
import { SubscriptionStateService } from '../../../../core/services/subscription-state-service';
import { PlanLimitModalService } from '../../../../core/services/plan-limit-modal-service';

@Component({
  selector: 'app-role-admin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-admin-view.html'
})
export class RoleAdminViewComponent {
  protected readonly authService = inject(AuthService);
  protected readonly subscriptionState = inject(SubscriptionStateService);
  protected readonly planLimitModalService = inject(PlanLimitModalService);

  @Input({ required: true }) companies: CompanyListDTO[] = [];
  @Input({ required: true }) isLoading: boolean = false;

  @Output() addCompany = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<CompanyListDTO | undefined>();
  @Output() toggleStatus = new EventEmitter<CompanyListDTO>();

  readonly SubscriptionPlanEnum = SubscriptionPlan;
  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
  readonly maxCompanies = computed(() => this.subscriptionState.maxCompanies());

  readonly hasReachedCompanyLimit = computed(() => {
    if (this.currentPlan() === SubscriptionPlan.NONE) return true;
    const max = this.maxCompanies();
    if (max === -1) return false;
    return this.companies.length >= max;
  });

  onAddCompanyClick(): void {
    if (this.authService.isSuspendedForChargeback() || this.authService.pendingDebtArs() > 0) {
      this.planLimitModalService.openChargeback({
        pendingDebtArs: this.authService.pendingDebtArs()
      });
      return;
    }

    if (this.currentPlan() === SubscriptionPlan.NONE) {
      this.planLimitModalService.open({
        title: 'Sin Plan Activo',
        message: 'No posees un plan de suscripción activo ni periodo de prueba. Por favor, selecciona un plan para crear y administrar sucursales.',
        targetPlan: SubscriptionPlan.BASIC,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    if (this.hasReachedCompanyLimit()) {
      this.planLimitModalService.open({
        title: 'Límite de Sucursales Alcanzado',
        message: `Has alcanzado el límite de ${this.maxCompanies()} sucursal(es) permitida(s) en tu plan ${this.currentPlan()}. Actualiza a un plan superior para registrar más empresas.`,
        targetPlan: this.currentPlan() === SubscriptionPlan.BASIC ? SubscriptionPlan.PRO : SubscriptionPlan.ENTERPRISE,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }

    this.addCompany.emit();
  }
}
