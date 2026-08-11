import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardListDTO, Role } from '../../../../core/models';

@Component({
  selector: 'app-tab-rewards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-rewards.html',
  host: { class: 'block' }
})
export class TabRewardsComponent {
  @Input() rewards: RewardListDTO[] = [];
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addReward = new EventEmitter<void>();
  @Output() editReward = new EventEmitter<RewardListDTO>();
  @Output() redeemReward = new EventEmitter<number>();

  readonly RoleEnum = Role;
}
