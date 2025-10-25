import type { Timestamp } from 'firebase-admin/firestore';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_PROGRESS', 'READY', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

const ORDER_STATUS_LANGUAGES = ['ru', 'en'] as const;

export type OrderStatusLanguage = (typeof ORDER_STATUS_LANGUAGES)[number];

export const DEFAULT_ORDER_STATUS_LANGUAGE: OrderStatusLanguage = 'ru';

type OrderStatusLabelsMap = Record<OrderStatus, string>;

const ORDER_STATUS_LABELS_I18N: Record<OrderStatusLanguage, OrderStatusLabelsMap> = {
  ru: {
    NEW: 'Новый',
    IN_PROGRESS: 'Готовится',
    READY: 'Готов',
    COMPLETED: 'Выдан',
    CANCELLED: 'Отменён'
  },
  en: {
    NEW: 'New',
    IN_PROGRESS: 'In progress',
    READY: 'Ready',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  }
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> =
  ORDER_STATUS_LABELS_I18N[DEFAULT_ORDER_STATUS_LANGUAGE];

export const ORDER_STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  IN_PROGRESS: 'Принять',
  READY: 'Готов',
  COMPLETED: 'Выдан',
  CANCELLED: 'Отменить'
};

const normalizeLanguage = (language?: string): OrderStatusLanguage => {
  if (!language) {
    return DEFAULT_ORDER_STATUS_LANGUAGE;
  }

  const candidate = language.toLowerCase().split(/[-_]/)[0];

  if (ORDER_STATUS_LANGUAGES.includes(candidate as OrderStatusLanguage)) {
    return candidate as OrderStatusLanguage;
  }

  return DEFAULT_ORDER_STATUS_LANGUAGE;
};

export const getOrderStatusLabels = (language?: string): OrderStatusLabelsMap => {
  const normalizedLanguage = normalizeLanguage(language);
  return ORDER_STATUS_LABELS_I18N[normalizedLanguage];
};

export const getOrderStatusLabel = (status: OrderStatus, language?: string): string => {
  const labels = getOrderStatusLabels(language);
  return labels[status];
};

export type OrderItem = {
  name: string;
  qty: number;
  options: string[];
};

export type OrderTimelineEntry = {
  status: OrderStatus;
  at: Timestamp;
  actor: string;
};

export type OrderDocument = {
  number: number;
  userId: string;
  branchId: string;
  branchName: string;
  status: OrderStatus;
  scheduledFor?: string;
  customerName?: string;
  items: OrderItem[];
  timeline?: OrderTimelineEntry[];
};

export type OrderRecord = OrderDocument & {
  id: string;
};
