import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyDetailDTO, Role } from '../../../../core/models';
import { SubscriptionStateService } from '../../../../core/services/subscription-state-service';

@Component({
  selector: 'app-company-detail-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-detail-header.html',
  host: { class: 'block' }
})
export class CompanyDetailHeaderComponent {
  protected readonly subscriptionState = inject(SubscriptionStateService);

  @Input({ required: true }) company!: CompanyDetailDTO;
  @Input({ required: true }) currentRole!: Role | null;

  @Output() back = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<void>();
  @Output() checkPoints = new EventEmitter<void>();

  readonly RoleEnum = Role;
  readonly currentPlan = computed(() => this.subscriptionState.currentPlan());
}
