import { CompanyListDTO } from './company.model';

export interface SaleListDTO {
  id: number;
  amount: number;
}

export interface SaleDetailDTO {
  id: number;
  amount: number;
  company: CompanyListDTO;
}

export interface SaleRequestDTO {
  amount: number;
  companyId: number;
  userDni: string;
}
