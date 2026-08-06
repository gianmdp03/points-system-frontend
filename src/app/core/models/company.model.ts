import { PointsAccountDetailDTO } from './points-account.model';
import { ProductListDTO } from './product.model';
import { PromotionListDTO } from './promotion.model';
import { RewardListDTO } from './reward.model';

export interface CompanyDetails {
  country: string;
  province: string;
  city: string;
  address: string;
  zipCode: string;
}

export interface CompanyListDTO {
  id: number;
  name: string;
  companyDetails: CompanyDetails;
  amountStep: number;
  pointsPerStep: number;
  isEnabled: boolean;
}

export interface CompanyDetailDTO {
  id: number;
  name: string;
  companyDetails: CompanyDetails;
  amountStep: number;
  pointsPerStep: number;
  isEnabled: boolean;
  appAdminOwner?: string;
  pointsAccounts?: PointsAccountDetailDTO[];
  products?: ProductListDTO[];
  promotions?: PromotionListDTO[];
  rewards?: RewardListDTO[];
}

export interface CompanyRequestDTO {
  name: string;
  companyDetails: CompanyDetails;
  amountStep: number;
  pointsPerStep: number;
}

export interface CompanyUpdateDTO {
  name?: string;
  companyDetails?: Partial<CompanyDetails>;
  amountStep?: number;
  pointsPerStep?: number;
}
