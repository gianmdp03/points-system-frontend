import { CompanyListDTO } from './company.model';

export interface RewardListDTO {
  id: number;
  name: string;
  description: string;
  costInPoints: number;
  isEnabled: boolean;
}

export interface RewardDetailDTO {
  id: number;
  name: string;
  description: string;
  costInPoints: number;
  isEnabled: boolean;
  company: CompanyListDTO;
}

export interface RewardRequestDTO {
  name: string;
  description?: string;
  costInPoints: number;
  companyId: number;
}

export interface RewardUpdateDTO {
  name?: string;
  description?: string;
  pointsToEarn?: number;
}

export interface RewardRedeemDTO {
  companyId: number;
  rewardId: number;
  userDni: string;
}
