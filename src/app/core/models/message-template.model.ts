import { CompanyListDTO } from './company.model';

export enum NotificationType {
  WELCOME_NOTIFICATION = 'WELCOME_NOTIFICATION',
  ALMOST_THERE_NOTIFICATION = 'ALMOST_THERE_NOTIFICATION',
  CLIENT_RETENTION_NOTIFICATION = 'CLIENT_RETENTION_NOTIFICATION',
  POINTS_EXPIRATION_NOTIFICATION = 'POINTS_EXPIRATION_NOTIFICATION',
  PROMOTION_NOTIFICATION = 'PROMOTION_NOTIFICATION',
  CUSTOM_NOTIFICATION = 'CUSTOM_NOTIFICATION'
}

export interface MessageTemplate {
  id: number;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  isEnabled: boolean;
  company?: CompanyListDTO;
}

export interface MessageTemplateRequestDTO {
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  companyId: number;
}

export interface MessageTemplateUpdateDTO {
  name?: string;
  type?: NotificationType;
  subject?: string;
  content?: string;
}

export interface MessageTemplateListDTO {
  id: number;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  isEnabled: boolean;
}

export interface MessageTemplateDetailDTO {
  id: number;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  isEnabled: boolean;
  company: CompanyListDTO;
}

export type CreateMessageTemplateDTO = MessageTemplateRequestDTO;
export type UpdateMessageTemplateDTO = MessageTemplateUpdateDTO;

export interface NotificationVariable {
  token: string;
  label: string;
  example: string;
}

export interface NotificationTypeMetadata {
  type: NotificationType;
  friendlyTitle: string;
  triggerDescription: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  availableVariables: NotificationVariable[];
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeMetadata> = {
  [NotificationType.WELCOME_NOTIFICATION]: {
    type: NotificationType.WELCOME_NOTIFICATION,
    friendlyTitle: 'Aviso de Bienvenida',
    triggerDescription: 'Automático al asociarse o registrarse un cliente por primera vez con notificaciones activadas.',
    icon: '🚀',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    accentColor: 'border-blue-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' },
      { token: '{local}', label: 'Nombre del local o sucursal', example: 'Sucursal Centro' }
    ]
  },
  [NotificationType.ALMOST_THERE_NOTIFICATION]: {
    type: NotificationType.ALMOST_THERE_NOTIFICATION,
    friendlyTitle: 'Cerca del Beneficio (15% restante)',
    triggerDescription: 'Automático cuando el cliente alcanza el 85% de los puntos requeridos para cualquier beneficio activo (15% faltante). Se notifica por cada beneficio alcanzado.',
    icon: '🎯',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    accentColor: 'border-emerald-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' },
      { token: '{puntos_faltantes}', label: 'Puntos que le faltan', example: '50' },
      { token: '{puntos}', label: 'Puntos acumulados actuales', example: '450' },
      { token: '{local}', label: 'Nombre del local', example: 'Sucursal Centro' }
    ]
  },
  [NotificationType.CLIENT_RETENTION_NOTIFICATION]: {
    type: NotificationType.CLIENT_RETENTION_NOTIFICATION,
    friendlyTitle: 'Retención Periódica de Clientes',
    triggerDescription: 'Frecuencia configurable por la empresa. Envío recurrente e indefinido cada N días de inactividad mientras el cliente no registre visitas.',
    icon: '⏰',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    accentColor: 'border-amber-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' },
      { token: '{puntos}', label: 'Saldo de puntos actual disponible', example: '450' },
      { token: '{local}', label: 'Nombre del local', example: 'Sucursal Centro' }
    ]
  },
  [NotificationType.POINTS_EXPIRATION_NOTIFICATION]: {
    type: NotificationType.POINTS_EXPIRATION_NOTIFICATION,
    friendlyTitle: 'Puntos por Vencer (30d y 10d)',
    triggerDescription: 'Preventivo automático en 2 hitos estratégicos: a los 30 días (1 mes) y a los 10 días previos al vencimiento de los puntos.',
    icon: '⏳',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    accentColor: 'border-rose-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' },
      { token: '{puntos}', label: 'Cantidad de puntos por vencer', example: '450' },
      { token: '{dias}', label: 'Días restantes antes de expirar (30 o 10)', example: '30' }
    ]
  },
  [NotificationType.PROMOTION_NOTIFICATION]: {
    type: NotificationType.PROMOTION_NOTIFICATION,
    friendlyTitle: 'Promociones Activas',
    triggerDescription: 'Automático en tiempo real al crear o activar una nueva promoción para todos los clientes suscritos del comercio.',
    icon: '🔥',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
    accentColor: 'border-orange-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' },
      { token: '{local}', label: 'Nombre del local', example: 'Sucursal Centro' }
    ]
  },
  [NotificationType.CUSTOM_NOTIFICATION]: {
    type: NotificationType.CUSTOM_NOTIFICATION,
    friendlyTitle: 'Mensaje Personalizado',
    triggerDescription: 'Plantilla de propósito general para avisos o novedades personalizadas a clientes.',
    icon: '💬',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    accentColor: 'border-indigo-500',
    availableVariables: [
      { token: '{nombre}', label: 'Nombre del cliente', example: 'María' },
      { token: '{empresa}', label: 'Nombre de la empresa', example: 'Café Martínez' }
    ]
  }
};

