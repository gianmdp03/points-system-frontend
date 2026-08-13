import { CompanyListDTO } from './company.model';

export interface SaleListDTO {
  id: number;
  amount: number;
  userDni?: string;
  userEmail?: string;
  userName?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    dni?: string;
  };
  pointsGenerated?: number;
  createdAt?: string;
}

export interface SaleDetailDTO {
  id: number;
  amount: number;
  company: CompanyListDTO;
  userDni?: string;
  userEmail?: string;
  userName?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    dni?: string;
  };
  pointsGenerated?: number;
  createdAt?: string;
}

export interface SaleRequestDTO {
  amount: number;
  companyId: number;
  userDni: string;
}

