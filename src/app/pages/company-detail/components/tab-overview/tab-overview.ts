import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyDetailDTO, Role } from '../../../../core/models';

@Component({
  selector: 'app-tab-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-overview.html',
  host: { class: 'block' }
})
export class TabOverviewComponent {
  @Input({ required: true }) company!: CompanyDetailDTO;
  @Input({ required: true }) currentRole!: Role | null;
  @Input() userPointsBalance: number | null = null;

  @Output() editCompany = new EventEmitter<void>();

  readonly RoleEnum = Role;
}
