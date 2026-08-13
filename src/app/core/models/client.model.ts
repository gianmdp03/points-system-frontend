export interface ClientDetailDTO {
  id: number;
  dni: string;
  country: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface ClientRequestDTO {
  dni: string;
  country: string;
  name: string;
  email?: string;
  phone?: string;
}
