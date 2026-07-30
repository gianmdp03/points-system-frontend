import { CompanyListDTO } from './company.model';
import { UserDetailDTO } from './user.model';

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
  company: CompanyListDTO;
  user: UserDetailDTO;
}

export interface PointsAccountRequestDTO {
  companyId: number;
  email: string;
  name: string;
  dni: string;
}
