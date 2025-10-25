import * as admin from 'firebase-admin';

import {
  ORDER_STATUS_TRANSITIONS,
  type OrderDocument,
  type OrderRecord,
  type OrderStatus,
  type OrderTimelineEntry
} from './types';

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} was not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(current: OrderStatus, next: OrderStatus) {
    super(`Cannot transition order from ${current} to ${next}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

const collection = () => admin.firestore().collection('orders');

export const getOrderById = async (orderId: string): Promise<OrderRecord | null> => {
  const snapshot = await collection().doc(orderId).get();

  if (!snapshot.exists) {
    return null;
  }

  return { id: snapshot.id, ...(snapshot.data() as OrderDocument) };
};

export const applyOrderStatusTransition = async (
  orderId: string,
  nextStatus: OrderStatus,
  actor: string
): Promise<OrderRecord> => {
  const db = admin.firestore();
  const ref = collection().doc(orderId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists) {
      throw new OrderNotFoundError(orderId);
    }

    const order = snapshot.data() as OrderDocument;

    const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new InvalidStatusTransitionError(order.status, nextStatus);
    }

    const now = admin.firestore.Timestamp.now();
    const timeline: OrderTimelineEntry[] = [
      ...(order.timeline ?? []),
      { status: nextStatus, at: now, actor }
    ];

    const updatedOrder: OrderDocument = {
      ...order,
      status: nextStatus,
      timeline
    };

    transaction.update(ref, {
      status: nextStatus,
      timeline
    });

    return { id: orderId, ...updatedOrder };
  });
};
