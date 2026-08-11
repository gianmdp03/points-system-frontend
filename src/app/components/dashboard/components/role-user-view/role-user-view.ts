import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyListDTO } from '../../../../core/models';

@Component({
  selector: 'app-role-user-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-user-view.html'
})
export class RoleUserViewComponent {
  @Input({ required: true }) companies: CompanyListDTO[] = [];
  @Input({ required: true }) totalElements: number = 0;
  @Input({ required: true }) isLoading: boolean = false;

  get displayTotal(): number {
    return this.totalElements > 0 ? this.totalElements : (this.companies?.length || 0);
  }
}
