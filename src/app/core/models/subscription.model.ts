export enum SubscriptionPlan {
  NONE = 'NONE',
  FREE_TRIAL = 'FREE_TRIAL',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum PaymentProvider {
  MOCK = 'MOCK',
  MERCADOPAGO = 'MERCADO_PAGO',
  MERCADO_PAGO = 'MERCADO_PAGO',
  STRIPE = 'STRIPE'
}

export interface SubscriptionRequestDTO {
  plan: SubscriptionPlan;
  provider: PaymentProvider | 'MERCADO_PAGO';
  billingPeriod: BillingPeriod;
  returnUrl?: string;
  companyId?: number;
}

export interface SubscriptionResponseDTO {
  subscriptionId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider | 'MERCADO_PAGO';
  price: number;
  currency: string;
  checkoutUrl: string;
  externalSubscriptionId?: string;
}

export interface SubscriptionDetailDTO {
  id: number | null;
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  provider: PaymentProvider | 'MERCADO_PAGO';
  price: number;
  currency: string;
  externalSubscriptionId?: string | null;
  startDate?: string | null;
  nextBillingDate?: string | null;
  cancelledAt?: string | null;
}

export interface PlanConfig {
  plan: SubscriptionPlan;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxClients: number; // -1 means unlimited
  maxRewards: number; // -1 means unlimited
  maxCompanies: number; // -1 means unlimited
  canCreatePromotions: boolean;
  isPopular?: boolean;
  isHidden?: boolean; // Hidden from public pricing purchase cards (e.g. NONE, FREE_TRIAL)
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  [SubscriptionPlan.NONE]: {
    plan: SubscriptionPlan.NONE,
    name: 'Sin Plan Activo',
    tagline: 'No posees un plan de suscripción activo ni periodo de prueba.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'ARS',
    maxClients: 0,
    maxRewards: 0,
    maxCompanies: 0,
    canCreatePromotions: false,
    isPopular: false,
    isHidden: true,
    features: [
      'Sin sucursales habilitadas',
      'Sin clientes habilitados',
      'Requiere contratar un plan para operar'
    ]
  },
  [SubscriptionPlan.FREE_TRIAL]: {
    plan: SubscriptionPlan.FREE_TRIAL,
    name: 'Prueba Gratuita',
    tagline: 'Periodo de prueba activo de 30 días sin costo.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'ARS',
    maxClients: 100,
    maxRewards: 5,
    maxCompanies: 1,
    canCreatePromotions: true,
    isPopular: false,
    isHidden: true,
    features: [
      '1 sucursal comercial',
      'Hasta 100 clientes registrados',
      'Hasta 5 premios o recompensas',
      'Campañas de promociones y multiplicadores habilitadas',
      'Prueba de 30 días incluida'
    ]
  },
  [SubscriptionPlan.BASIC]: {
    plan: SubscriptionPlan.BASIC,
    name: 'Plan Emprendedor',
    tagline: 'Ideal para pequeños locales o comercios en etapa inicial.',
    priceMonthly: 9900,
    priceYearly: 99000,
    currency: 'ARS',
    maxClients: 100,
    maxRewards: 5,
    maxCompanies: 1,
    canCreatePromotions: false,
    isPopular: false,
    isHidden: false,
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
    priceMonthly: 19900,
    priceYearly: 199000,
    currency: 'ARS',
    maxClients: 1000,
    maxRewards: -1,
    maxCompanies: 3,
    canCreatePromotions: true,
    isPopular: true,
    isHidden: false,
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
    priceMonthly: 39900,
    priceYearly: 399000,
    currency: 'ARS',
    maxClients: -1,
    maxRewards: -1,
    maxCompanies: -1,
    canCreatePromotions: true,
    isPopular: false,
    isHidden: false,
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

export function getSubscriptionStatusLabel(status: SubscriptionStatus | string | undefined | null): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'Activa';
    case SubscriptionStatus.PENDING:
      return 'En Proceso';
    case SubscriptionStatus.PAYMENT_FAILED:
      return 'Pago Rechazado';
    case SubscriptionStatus.CANCELLED:
      return 'Cancelada';
    case SubscriptionStatus.EXPIRED:
      return 'Vencida';
    default:
      return 'Inactiva';
  }
}

export function getSubscriptionStatusBadgeClass(status: SubscriptionStatus | string | undefined | null): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case SubscriptionStatus.PENDING:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case SubscriptionStatus.PAYMENT_FAILED:
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case SubscriptionStatus.CANCELLED:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    case SubscriptionStatus.EXPIRED:
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
}
