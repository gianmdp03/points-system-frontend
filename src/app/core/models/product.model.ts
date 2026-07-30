import { CompanyListDTO } from './company.model';

export interface ProductListDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface ProductDetailDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  company: CompanyListDTO;
}

export interface ProductRequestDTO {
  name: string;
  description?: string;
  price: number;
  image?: string;
  companyId: number;
}

export interface ProductUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
}
