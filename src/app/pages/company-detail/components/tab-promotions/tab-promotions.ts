import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PromotionListDTO, Role } from '../../../../core/models';

@Component({
  selector: 'app-tab-promotions',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './tab-promotions.html'
})
export class TabPromotionsComponent {
  @Input() promotions: PromotionListDTO[] = [];
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addPromotion = new EventEmitter<void>();
  @Output() editPromotion = new EventEmitter<PromotionListDTO>();

  readonly RoleEnum = Role;
}
