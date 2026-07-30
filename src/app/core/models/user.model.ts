export enum Role {
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  APP_ADMIN = 'APP_ADMIN'
}

export interface UserDetailDTO {
  id: string;
  email: string;
  name: string;
  dni: string;
  role: Role;
}
