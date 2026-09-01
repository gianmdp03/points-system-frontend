import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
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
  readonly inactiveAccounts = input<PointsAccountDetailDTO[]>([]);
  readonly totalElements = input<number>(0);
  readonly totalPages = input<number>(1);
  readonly currentPage = input<number>(0);
  readonly selectedDays = input<number>(30);
  readonly isLoading = input<boolean>(false);

  readonly daysChange = output<number>();
  readonly pageChange = output<number>();
  readonly openWhatsappRetention = output<PointsAccountDetailDTO>();

  readonly presetDays: number[] = [7, 15, 30, 60, 90, 180];
  readonly customDaysInput = signal<number>(30);

  onSelectPreset(days: number): void {
    if (this.selectedDays() === days && !this.isLoading()) return;
    this.customDaysInput.set(days);
    this.daysChange.emit(days);
  }

  onCustomDaysSubmit(): void {
    const days = Number(this.customDaysInput());
    if (!isNaN(days) && days > 0 && days !== this.selectedDays()) {
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