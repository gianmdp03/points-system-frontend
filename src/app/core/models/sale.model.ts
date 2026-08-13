import { CompanyListDTO } from './company.model';
import { ClientDetailDTO } from './client.model';

export interface SaleListDTO {
  id: number;
  amount: number;
  client?: ClientDetailDTO;
  userDni?: string;
  userEmail?: string;
  userName?: string;
  pointsGenerated?: number;
  createdAt?: string;
}

export interface SaleDetailDTO {
  id: number;
  amount: number;
  company: CompanyListDTO;
  client?: ClientDetailDTO;
  pointsGenerated?: number;
  createdAt?: string;
}

export interface SaleRequestDTO {
  amount: number;
  companyId: number;
  dni: string;
  country: string;
}
