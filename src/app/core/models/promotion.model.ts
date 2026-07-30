import { CompanyListDTO } from './company.model';

export interface PromotionListDTO {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isEnabled: boolean;
  multiplier: number;
}

export interface PromotionDetailDTO {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  isEnabled: boolean;
  company: CompanyListDTO;
}

export interface PromotionRequestDTO {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  companyId: number;
}

export interface PromotionUpdateDTO {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  multiplier?: number;
}
