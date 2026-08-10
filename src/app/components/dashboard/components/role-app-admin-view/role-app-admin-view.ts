import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyListDTO } from '../../../../core/models';

@Component({
  selector: 'app-role-app-admin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-app-admin-view.html'
})
export class RoleAppAdminViewComponent {
  @Input({ required: true }) companies: CompanyListDTO[] = [];
  @Input({ required: true }) totalElements: number = 0;
  @Input({ required: true }) isLoading: boolean = false;

  @Output() addCompany = new EventEmitter<void>();
  @Output() editCompany = new EventEmitter<CompanyListDTO>();
  @Output() toggleStatus = new EventEmitter<CompanyListDTO>();
}
