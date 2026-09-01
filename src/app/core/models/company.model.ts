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
  isPointsExpirationEnabled?: boolean;
  pointsExpirationDays?: number | null;
  isInactiveClientPurgeEnabled?: boolean;
  inactiveClientPurgeDays?: number | null;
  isClientRetentionEnabled?: boolean;
  clientRetentionDays?: number | null;
}

export interface CompanyDetailDTO {
  id: number;
  name: string;
  companyDetails: CompanyDetails;
  amountStep: number;
  pointsPerStep: number;
  isEnabled: boolean;
  isPointsExpirationEnabled?: boolean;
  pointsExpirationDays?: number | null;
  isInactiveClientPurgeEnabled?: boolean;
  inactiveClientPurgeDays?: number | null;
  isClientRetentionEnabled?: boolean;
  clientRetentionDays?: number | null;
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
  isPointsExpirationEnabled?: boolean;
  pointsExpirationDays?: number | null;
  isInactiveClientPurgeEnabled?: boolean;
  inactiveClientPurgeDays?: number | null;
  isClientRetentionEnabled?: boolean;
  clientRetentionDays?: number | null;
}

export interface CompanyUpdateDTO {
  name?: string;
  companyDetails?: Partial<CompanyDetails>;
  amountStep?: number;
  pointsPerStep?: number;
  isPointsExpirationEnabled?: boolean;
  pointsExpirationDays?: number | null;
  isInactiveClientPurgeEnabled?: boolean;
  inactiveClientPurgeDays?: number | null;
  isClientRetentionEnabled?: boolean;
  clientRetentionDays?: number | null;
}

export interface CompanyPublicDetailDTO {
  id: number;
  name: string;
  companyDetails: CompanyDetails;
  amountStep: number;
  pointsPerStep: number;
  isEnabled: boolean;
  clientBalance: number;
  clientName: string;
  isNotificationEnabled?: boolean;
  isPointsExpirationEnabled?: boolean;
  pointsExpirationDays?: number | null;
  isInactiveClientPurgeEnabled?: boolean;
  inactiveClientPurgeDays?: number | null;
  isClientRetentionEnabled?: boolean;
  clientRetentionDays?: number | null;
  products: ProductListDTO[];
  activePromotions: PromotionListDTO[];
  rewards: RewardListDTO[];
}
