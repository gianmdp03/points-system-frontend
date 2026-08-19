export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum PaymentProvider {
  MOCK = 'MOCK',
  MERCADOPAGO = 'MERCADOPAGO',
  STRIPE = 'STRIPE'
}

export interface SubscriptionRequestDTO {
  plan: SubscriptionPlan;
  provider: PaymentProvider;
  billingPeriod: BillingPeriod;
  returnUrl?: string;
  companyId?: number;
}

export interface SubscriptionResponseDTO {
  subscriptionId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  price: number;
  currency: string;
  checkoutUrl: string;
  externalSubscriptionId?: string;
}

export interface SubscriptionDetailDTO {
  id: number;
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  price: number;
  currency: string;
  externalSubscriptionId?: string;
  startDate?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
}

export interface PlanConfig {
  plan: SubscriptionPlan;
  name: string;
  tagline: string;
  priceMonthly: number;
  currency: string;
  maxClients: number; // -1 means unlimited
  maxRewards: number; // -1 means unlimited
  maxCompanies: number; // -1 means unlimited
  canCreatePromotions: boolean;
  isPopular?: boolean;
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  [SubscriptionPlan.BASIC]: {
    plan: SubscriptionPlan.BASIC,
    name: 'Plan Emprendedor',
    tagline: 'Ideal para pequeños locales o comercios en etapa inicial.',
    priceMonthly: 19,
    currency: 'USD',
    maxClients: 100,
    maxRewards: 5,
    maxCompanies: 1,
    canCreatePromotions: false,
    isPopular: false,
    features: [
      'Hasta 100 clientes registrados',
      'Hasta 5 premios o recompensas',
      '1 sucursal comercial',
      'Catálogo básico de productos',
      'App móvil para escaneo QR',
      'Soporte por Email'
    ]
  },
  [SubscriptionPlan.PRO]: {
    plan: SubscriptionPlan.PRO,
    name: 'Plan Crecimiento',
    tagline: 'Para marcas en expansión que buscan automatizar su fidelización.',
    priceMonthly: 49,
    currency: 'USD',
    maxClients: 1000,
    maxRewards: -1,
    maxCompanies: 3,
    canCreatePromotions: true,
    isPopular: true,
    features: [
      'Hasta 1,000 clientes registrados',
      'Premios y recompensas ilimitados',
      'Hasta 3 sucursales comerciales',
      'Campañas y promociones con multiplicadores (2x, 3x)',
      'Analytics avanzado y reportes',
      'Soporte prioritario por WhatsApp'
    ]
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    name: 'Plan Corporativo',
    tagline: 'Franquicias o cadenas con múltiples sucursales y alto volumen.',
    priceMonthly: 99,
    currency: 'USD',
    maxClients: -1,
    maxRewards: -1,
    maxCompanies: -1,
    canCreatePromotions: true,
    isPopular: false,
    features: [
      'Clientes ilimitados',
      'Premios y recompensas ilimitados',
      'Sucursales y empresas ilimitadas',
      'Campañas y promociones ilimitadas',
      'Marca blanca y dominio personalizado',
      'API custom de integración',
      'Soporte 24/7 y ejecutivo de cuenta dedicado'
    ]
  }
};
