import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, SaleListDTO } from '../../../../core/models';

@Component({
  selector: 'app-tab-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-sales.html'
})
export class TabSalesComponent {
  @Input() sales: SaleListDTO[] = [];
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addSale = new EventEmitter<void>();
  @Output() editSale = new EventEmitter<SaleListDTO | void>();

  readonly RoleEnum = Role;
}
