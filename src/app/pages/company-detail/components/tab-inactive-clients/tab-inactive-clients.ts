import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointsAccountDetailDTO } from '../../../../core/models';

@Component({
  selector: 'app-tab-inactive-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tab-inactive-clients.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class TabInactiveClientsComponent {
  @Input({ required: true }) inactiveAccounts: PointsAccountDetailDTO[] = [];
  @Input() totalElements: number = 0;
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 0;
  @Input() selectedDays: number = 30;
  @Input() isLoading: boolean = false;

  @Output() daysChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() registerSale = new EventEmitter<{ dni: string; country: string }>();

  readonly presetDays: number[] = [7, 15, 30, 60, 90, 180];
  readonly customDaysInput = signal<number>(30);

  onSelectPreset(days: number): void {
    if (this.selectedDays === days && !this.isLoading) return;
    this.customDaysInput.set(days);
    this.daysChange.emit(days);
  }

  onCustomDaysSubmit(): void {
    const days = Number(this.customDaysInput());
    if (!isNaN(days) && days > 0 && days !== this.selectedDays) {
      this.daysChange.emit(days);
    }
  }

  getDaysSinceLastActivity(dateStr?: string): number | null {
    if (!dateStr) return null;
    const activityDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  formatRelativeTime(dateStr?: string): string {
    const days = this.getDaysSinceLastActivity(dateStr);
    if (days === null) {
      return 'Sin actividad registrada';
    }
    if (days === 0) {
      return 'Hoy';
    }
    if (days === 1) {
      return 'Ayer';
    }
    return `Hace ${days} días`;
  }
}