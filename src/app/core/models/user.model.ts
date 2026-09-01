import { SubscriptionPlan } from './subscription.model';

export enum Role {
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  APP_ADMIN = 'APP_ADMIN'
}

export interface UserDetailDTO {
  id: string;
  email: string;
  name: string;
  dni: string;
  role: Role;
  currentPlan?: SubscriptionPlan;
  planExpirationDate?: string;
  isFreeTrialOver?: boolean;
  freeTrialStartTime?: string;
  freeTrialEndTime?: string;
  isSuspendedForChargeback?: boolean;
  pendingDebtArs?: number;
}