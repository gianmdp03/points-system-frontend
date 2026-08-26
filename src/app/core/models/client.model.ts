export interface ClientDetailDTO {
  id: number;
  dni: string;
  country: string;
  name: string;
  email?: string;
  phone?: string;
  isNotificationEnabled?: boolean;
}

export interface ClientJoinRequestDTO {
  companyId: number;
  dni: string;
  country: string;
  name: string;
  email?: string;
  phone?: string;
  isNotificationEnabled?: boolean;
}