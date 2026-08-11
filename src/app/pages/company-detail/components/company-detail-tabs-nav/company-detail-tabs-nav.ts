import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CompanyDetailTab = 'overview' | 'products' | 'promotions' | 'rewards' | 'sales';

@Component({
  selector: 'app-company-detail-tabs-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-detail-tabs-nav.html',
  host: { class: 'block' }
})
export class CompanyDetailTabsNavComponent {
  @Input({ required: true }) activeTab!: CompanyDetailTab;
  @Input() productsCount: number = 0;
  @Input() promotionsCount: number = 0;
  @Input() rewardsCount: number = 0;

  @Output() selectTab = new EventEmitter<CompanyDetailTab>();
}
