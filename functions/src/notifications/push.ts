import * as admin from 'firebase-admin';

import { ORDER_STATUS_LABELS, type OrderRecord, type OrderStatus } from '../orders/types';

type OrderStatusPushTemplate = {
  title: string;
  body: (order: OrderRecord) => string;
};

const ORDER_STATUS_PUSH_TEMPLATES: Partial<Record<OrderStatus, OrderStatusPushTemplate>> = {
  IN_PROGRESS: {
    title: 'Ваш заказ готовится',
    body: (order) => `Заведение «${order.branchName}» приняло заказ №${order.number}.`
  },
  READY: {
    title: 'Заказ готов к выдаче',
    body: (order) => `Заказ №${order.number} ждёт вас в «${order.branchName}».`
  },
  CANCELLED: {
    title: 'Заказ отменён',
    body: (order) => `Заказ №${order.number} в «${order.branchName}» отменён. Проверьте детали в приложении.`
  }
};

export const buildOrderStatusNotification = (order: OrderRecord) => {
  const template = ORDER_STATUS_PUSH_TEMPLATES[order.status];

  if (!template) {
    return null;
  }

  return {
    title: template.title,
    body: template.body(order),
    data: {
      orderId: order.id,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      branchId: order.branchId
    }
  } as const;
};

export const sendOrderStatusNotification = async (
  tokens: string[],
  payload: NonNullable<ReturnType<typeof buildOrderStatusNotification>>
) => {
  if (!tokens.length) {
    return;
  }

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: payload.data
  });
};
