import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Role } from '../../../../core/models';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-header.html'
})
export class DashboardHeaderComponent {
  @Input({ required: true }) currentRole!: Role;
  @Input({ required: true }) isLoggedIn: boolean = false;
  @Input() errorMessage: string | null = null;

  @Output() retryLoad = new EventEmitter<void>();

  readonly RoleEnum = Role;
}
