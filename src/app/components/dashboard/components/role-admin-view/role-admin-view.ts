import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyListDTO, SubscriptionPlan } from '../../../../core/models';
import { SubscriptionStateService } from '../../../../core/services/subscription-state-service';
import { PlanLimitModalService } from '../../../../core/services/plan-limit-modal-service';

@Component({
  selector: 'app-role-admin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-admin-view.html'
})
export class RoleAdminViewComponent {
  protected readonly subscriptionState = inject(SubscriptionStateService);
  protected readonly planLimitModalService = inject(PlanLimitModalService);

  @Input({ required: true }) companies: CompanyListDTO[] = [];
  @Input({ required: true }) isLoading: boolean = false;

  @Output() addCompany = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<CompanyListDTO | undefined>();
  @Output() toggleStatus = new EventEmitter<CompanyListDTO>();

  readonly maxCompanies = computed(() => this.subscriptionState.maxCompanies());
  readonly hasReachedCompanyLimit = computed(() => {
    const max = this.maxCompanies();
    if (max === -1) return false;
    return this.companies.length >= max;
  });

  onAddCompanyClick(): void {
    if (this.hasReachedCompanyLimit()) {
      this.planLimitModalService.open({
        title: 'Límite de Sucursales Alcanzado',
        message: `Has alcanzado el límite de ${this.maxCompanies()} sucursal(es) permitida(s) en tu plan ${this.subscriptionState.currentPlan()}. Actualiza a un plan superior para registrar más empresas.`,
        targetPlan: this.subscriptionState.currentPlan() === SubscriptionPlan.BASIC ? SubscriptionPlan.PRO : SubscriptionPlan.ENTERPRISE,
        upgradeRoute: '/dashboard/pricing'
      });
      return;
    }
    this.addCompany.emit();
  }
}
