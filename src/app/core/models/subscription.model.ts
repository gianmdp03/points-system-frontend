export enum SubscriptionPlan {
  NONE = 'NONE',
  FREE_TRIAL = 'FREE_TRIAL',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  EXPIRED = 'EXPIRED'
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  YEARLY = 'YEARLY'
}

export enum PaymentProvider {
  MOCK = 'MOCK',
  MERCADO_PAGO = 'MERCADO_PAGO',
  PADDLE = 'PADDLE',
  STRIPE = 'STRIPE'
}

export interface SubscriptionRequestDTO {
  plan: SubscriptionPlan;
  provider: PaymentProvider;
  billingPeriod: BillingPeriod;
  returnUrl?: string;
}

export interface SubscriptionUpgradeRequestDTO {
  newPlan: SubscriptionPlan;
}

export interface ProrationPreviewResponseDTO {
  currentPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  totalDaysInPeriod: number;
  remainingDays: number;
  currentPlanPrice: number;
  newPlanPrice: number;
  currentDailyRate: number;
  newDailyRate: number;
  proratedUpgradeAmount: number;
  currency: string;
}

export interface SubscriptionResponseDTO {
  subscriptionId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  price: number;
  currency: string;
  checkoutUrl?: string;
  externalSubscriptionId?: string;
}

export interface SubscriptionDetailDTO {
  id: number | null;
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  price: number;
  currency: string;
  externalSubscriptionId?: string | null;
  startDate?: string | null;
  planExpirationDate?: string | null;
  nextBillingDate?: string | null;
  daysRemaining?: number | null;
}

export interface PlanConfig {
  plan: SubscriptionPlan;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceQuarterly?: number;
  priceSemiannual?: number;
  priceYearly: number;
  priceMonthlyArs?: number;
  priceQuarterlyArs?: number;
  priceSemiannualArs?: number;
  priceYearlyArs?: number;
  priceMonthlyUsd?: number;
  priceQuarterlyUsd?: number;
  priceSemiannualUsd?: number;
  priceYearlyUsd?: number;
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
      'Campañas y promociones incluidas',
      'Soporte por Email'
    ]
  },
  [SubscriptionPlan.BASIC]: {
    plan: SubscriptionPlan.BASIC,
    name: 'Plan Emprendedor',
    tagline: 'Ideal para pequeños locales o comercios en etapa inicial.',
    priceMonthly: 9990,
    priceQuarterly: 26990,
    priceSemiannual: 49990,
    priceYearly: 99990,
    priceMonthlyArs: 9990,
    priceQuarterlyArs: 26990,
    priceSemiannualArs: 49990,
    priceYearlyArs: 99990,
    priceMonthlyUsd: 15.0,
    priceQuarterlyUsd: 40.0,
    priceSemiannualUsd: 75.0,
    priceYearlyUsd: 150.0,
    currency: 'ARS',
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
    priceMonthly: 19990,
    priceQuarterly: 53990,
    priceSemiannual: 99990,
    priceYearly: 199990,
    priceMonthlyArs: 19990,
    priceQuarterlyArs: 53990,
    priceSemiannualArs: 99990,
    priceYearlyArs: 199990,
    priceMonthlyUsd: 29.0,
    priceQuarterlyUsd: 79.0,
    priceSemiannualUsd: 149.0,
    priceYearlyUsd: 290.0,
    currency: 'ARS',
    maxClients: 1000,
    maxRewards: -1, // Unlimited
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
    priceMonthly: 39990,
    priceQuarterly: 107990,
    priceSemiannual: 199990,
    priceYearly: 399990,
    priceMonthlyArs: 39990,
    priceQuarterlyArs: 107990,
    priceSemiannualArs: 199990,
    priceYearlyArs: 399990,
    priceMonthlyUsd: 59.0,
    priceQuarterlyUsd: 159.0,
    priceSemiannualUsd: 299.0,
    priceYearlyUsd: 590.0,
    currency: 'ARS',
    maxClients: -1, // Unlimited
    maxRewards: -1, // Unlimited
    maxCompanies: -1, // Unlimited
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

export function getSubscriptionStatusBadgeClass(status?: SubscriptionStatus | null): string {
  switch (status) {
    case SubscriptionStatus.APPROVED:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case SubscriptionStatus.PENDING:
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case SubscriptionStatus.PAYMENT_FAILED:
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    case SubscriptionStatus.EXPIRED:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  }
}

export function getSubscriptionStatusLabel(status?: SubscriptionStatus | null): string {
  switch (status) {
    case SubscriptionStatus.APPROVED:
      return 'Activa / Aprobada';
    case SubscriptionStatus.PENDING:
      return 'Pendiente';
    case SubscriptionStatus.PAYMENT_FAILED:
      return 'Pago Fallido';
    case SubscriptionStatus.EXPIRED:
      return 'Expirada';
    default:
      return 'Sin Estado';
  }
}

export function getPlanTier(plan?: SubscriptionPlan | null): number {
  if (!plan) return 0;
  switch (plan) {
    case SubscriptionPlan.NONE: return 0;
    case SubscriptionPlan.FREE_TRIAL: return 1;
    case SubscriptionPlan.BASIC: return 2;
    case SubscriptionPlan.PRO: return 3;
    case SubscriptionPlan.ENTERPRISE: return 4;
    default: return 0;
  }
}
