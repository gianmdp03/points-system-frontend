import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanLimitModalService } from '../../core/services/plan-limit-modal-service';

@Component({
  selector: 'app-plan-limit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-limit-modal.html'
})
export class PlanLimitModalComponent {
  protected readonly modalService = inject(PlanLimitModalService);
  private readonly router = inject(Router);

  close(): void {
    this.modalService.close();
  }

  goToUpgrade(): void {
    const route = this.modalService.upgradeRoute();
    this.modalService.close();
    this.router.navigate([route]);
  }
}
