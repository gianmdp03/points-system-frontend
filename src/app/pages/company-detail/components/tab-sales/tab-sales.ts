import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, SaleListDTO } from '../../../../core/models';

@Component({
  selector: 'app-tab-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-sales.html',
  host: { class: 'block' }
})
export class TabSalesComponent {
  @Input() sales: SaleListDTO[] = [];
  @Input() isLoading: boolean = false;
  @Input() amountStep: number = 100;
  @Input() pointsPerStep: number = 10;
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addSale = new EventEmitter<void>();
  @Output() addClient = new EventEmitter<void>();
  @Output() editSale = new EventEmitter<SaleListDTO>();

  readonly RoleEnum = Role;

  getCalculatedPoints(sale: SaleListDTO): number {
    if (sale.pointsGenerated !== undefined && sale.pointsGenerated !== null) {
      return sale.pointsGenerated;
    }
    if (!this.amountStep || this.amountStep <= 0) return 0;
    return Math.floor((sale.amount / this.amountStep) * this.pointsPerStep);
  }
}

