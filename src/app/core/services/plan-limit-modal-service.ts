import { Injectable, signal } from '@angular/core';
import { SubscriptionPlan } from '../models';

export type PlanModalVariant = 'plan_limit' | 'chargeback';

export interface PlanLimitModalData {
  variant?: PlanModalVariant;
  title?: string;
  message: string;
  targetPlan?: SubscriptionPlan;
  upgradeRoute?: string;
  pendingDebtArs?: number;
  actionText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanLimitModalService {
  readonly isOpen = signal<boolean>(false);
  readonly variant = signal<PlanModalVariant>('plan_limit');
  readonly title = signal<string>('Límite del Plan Alcanzado');
  readonly message = signal<string>('Has alcanzado el límite de tu plan actual. Actualiza a un plan superior para continuar.');
  readonly targetPlan = signal<SubscriptionPlan | null>(null);
  readonly upgradeRoute = signal<string>('/dashboard/pricing');
  readonly pendingDebtArs = signal<number>(0);
  readonly actionText = signal<string>('Mejorar mi Plan');

  open(data: string | PlanLimitModalData): void {
    if (typeof data === 'string') {
      this.variant.set('plan_limit');
      this.message.set(data);
      this.title.set('Límite del Plan Alcanzado');
      this.targetPlan.set(null);
      this.upgradeRoute.set('/dashboard/pricing');
      this.pendingDebtArs.set(0);
      this.actionText.set('Mejorar mi Plan');
    } else {
      this.variant.set(data.variant || 'plan_limit');
      this.message.set(data.message);
      this.title.set(data.title || (data.variant === 'chargeback' ? 'Cuenta Suspendida por Contracargo' : 'Límite del Plan Alcanzado'));
      this.targetPlan.set(data.targetPlan || null);
      this.upgradeRoute.set(data.upgradeRoute || (data.variant === 'chargeback' ? '/dashboard/subscription' : '/dashboard/pricing'));
      this.pendingDebtArs.set(data.pendingDebtArs || 0);
      this.actionText.set(data.actionText || (data.variant === 'chargeback' ? 'Regularizar Cuenta' : 'Mejorar mi Plan'));
    }
    this.isOpen.set(true);
  }

  openChargeback(data?: { title?: string; message?: string; pendingDebtArs?: number; upgradeRoute?: string; actionText?: string }): void {
    const debt = data?.pendingDebtArs || 0;
    this.variant.set('chargeback');
    this.title.set(data?.title || 'Cuenta Suspendida por Contracargo');
    this.message.set(
      data?.message ||
      'Se ha registrado un desconocimiento de pago (contracargo) en tu cuenta. Todas las operaciones comerciales se encuentran pausadas hasta regularizar el saldo pendiente.'
    );
    this.targetPlan.set(null);
    this.upgradeRoute.set(data?.upgradeRoute || '/dashboard/subscription');
    this.pendingDebtArs.set(debt);
    this.actionText.set(data?.actionText || (debt > 0 ? `Regularizar Cuenta ($${debt.toLocaleString('es-AR')} ARS)` : 'Regularizar Cuenta'));
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
