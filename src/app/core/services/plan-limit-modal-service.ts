import { Injectable, signal } from '@angular/core';
import { SubscriptionPlan } from '../models';

export interface PlanLimitModalData {
  title?: string;
  message: string;
  targetPlan?: SubscriptionPlan;
  upgradeRoute?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanLimitModalService {
  readonly isOpen = signal<boolean>(false);
  readonly title = signal<string>('Límite del Plan Alcanzado');
  readonly message = signal<string>('Has alcanzado el límite de tu plan actual. Actualiza a un plan superior para continuar.');
  readonly targetPlan = signal<SubscriptionPlan | null>(null);
  readonly upgradeRoute = signal<string>('/dashboard/pricing');

  open(data: string | PlanLimitModalData): void {
    if (typeof data === 'string') {
      this.message.set(data);
      this.title.set('Límite del Plan Alcanzado');
      this.targetPlan.set(null);
      this.upgradeRoute.set('/dashboard/pricing');
    } else {
      this.message.set(data.message);
      this.title.set(data.title || 'Límite del Plan Alcanzado');
      this.targetPlan.set(data.targetPlan || null);
      this.upgradeRoute.set(data.upgradeRoute || '/dashboard/pricing');
    }
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
