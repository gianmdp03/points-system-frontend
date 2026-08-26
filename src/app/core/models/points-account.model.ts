import { CompanyListDTO } from './company.model';
import { ClientDetailDTO } from './client.model';

export enum TransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED'
}

export interface PointsTransactionDetailDTO {
  id: number;
  amount: number;
  transactionType: TransactionType;
  createdAt: string;
}

export interface PointsAccountDetailDTO {
  id: number;
  balance: number;
  lastActivityDate?: string;
  company: CompanyListDTO;
  client: ClientDetailDTO;
}

export interface PointsAccountRequestDTO {
  companyId: number;
  dni: string;
  country: string;
  name: string;
  email?: string;
  phone?: string;
  isNotificationEnabled?: boolean;
}