import * as admin from 'firebase-admin';

import {
  DEFAULT_ORDER_STATUS_LANGUAGE,
  getOrderStatusLabel,
  type OrderRecord,
  type OrderStatus
} from '../orders/types';

type OrderStatusPushTemplate = {
  title: string;
  body: (order: OrderRecord) => string;
};

type LocalizedTemplates = Partial<Record<OrderStatus, OrderStatusPushTemplate>>;

type NotificationLanguage = 'ru' | 'en';

const ORDER_STATUS_PUSH_TEMPLATES: Record<NotificationLanguage, LocalizedTemplates> = {
  ru: {
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
  },
  en: {
    IN_PROGRESS: {
      title: 'Your order is being prepared',
      body: (order) => `"${order.branchName}" has accepted order #${order.number}.`
    },
    READY: {
      title: 'Order is ready for pickup',
      body: (order) => `Order #${order.number} is waiting for you at "${order.branchName}".`
    },
    CANCELLED: {
      title: 'Order was cancelled',
      body: (order) => `Order #${order.number} at "${order.branchName}" was cancelled. Review details in the app.`
    }
  }
};

const normalizeLanguage = (language?: string): NotificationLanguage => {
  if (!language) {
    return DEFAULT_ORDER_STATUS_LANGUAGE;
  }

  const candidate = language.toLowerCase().split(/[-_]/)[0];

  if (candidate === 'en') {
    return 'en';
  }

  return 'ru';
};

const getTemplate = (status: OrderStatus, language?: string) => {
  const normalized = normalizeLanguage(language);
  return (
    ORDER_STATUS_PUSH_TEMPLATES[normalized][status] ??
    ORDER_STATUS_PUSH_TEMPLATES[DEFAULT_ORDER_STATUS_LANGUAGE][status]
  );
};

export const buildOrderStatusNotification = (
  order: OrderRecord,
  options?: { language?: string }
) => {
  const template = getTemplate(order.status, options?.language);

  if (!template) {
    return null;
  }

  const language = options?.language;

  return {
    title: template.title,
    body: template.body(order),
    data: {
      orderId: order.id,
      status: order.status,
      statusLabel: getOrderStatusLabel(order.status, language),
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
