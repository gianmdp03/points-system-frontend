import { CompanyListDTO } from './company.model';

export enum NotificationType {
  WELCOME_NOTIFICATION = 'WELCOME_NOTIFICATION',
  ALMOST_THERE_NOTIFICATION = 'ALMOST_THERE_NOTIFICATION',
  CLIENT_RETENTION_NOTIFICATION = 'CLIENT_RETENTION_NOTIFICATION',
  POINTS_EXPIRATION_NOTIFICATION = 'POINTS_EXPIRATION_NOTIFICATION',
  PROMOTION_NOTIFICATION = 'PROMOTION_NOTIFICATION',
  CUSTOM_NOTIFICATION = 'CUSTOM_NOTIFICATION'
}

export interface MessageTemplateRequestDTO {
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  companyId: number;
}

export interface MessageTemplateUpdateDTO {
  name?: string;
  type?: NotificationType;
  subject?: string;
  content?: string;
}

export interface MessageTemplateListDTO {
  id: number;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  isEnabled: boolean;
}

export interface MessageTemplateDetailDTO {
  id: number;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  isEnabled: boolean;
  company: CompanyListDTO;
}