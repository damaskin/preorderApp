import type { Timestamp } from 'firebase-admin/firestore';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_PROGRESS', 'READY', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'Готовится',
  READY: 'Готов',
  COMPLETED: 'Выдан',
  CANCELLED: 'Отменён'
};

export const ORDER_STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  IN_PROGRESS: 'Принять',
  READY: 'Готов',
  COMPLETED: 'Выдан',
  CANCELLED: 'Отменить'
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
