import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyListDTO } from '../../../../core/models';

@Component({
  selector: 'app-role-admin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-admin-view.html'
})
export class RoleAdminViewComponent {
  @Input({ required: true }) companies: CompanyListDTO[] = [];
  @Input({ required: true }) isLoading: boolean = false;

  @Output() addCompany = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<CompanyListDTO | undefined>();
  @Output() toggleStatus = new EventEmitter<CompanyListDTO>();
}
