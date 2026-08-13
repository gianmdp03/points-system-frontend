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
  isFreeTrialOver?: boolean;
  freeTrialStartTime?: string;
  freeTrialEndTime?: string;
}
