import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyDetailDTO, Role } from '../../../../core/models';

@Component({
  selector: 'app-company-detail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-detail-header.html'
})
export class CompanyDetailHeaderComponent {
  @Input({ required: true }) company!: CompanyDetailDTO;
  @Input({ required: true }) currentRole!: Role | null;

  @Output() back = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<void>();

  readonly RoleEnum = Role;
}
