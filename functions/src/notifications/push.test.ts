import { describe, expect, it } from 'vitest';

import { buildOrderStatusNotification } from './push';
import type { OrderRecord } from '../orders/types';

const baseOrder: OrderRecord = {
  id: 'order-1',
  branchId: 'branch-1',
  branchName: 'Rocket Coffee',
  customerName: 'Ivan',
  number: 101,
  status: 'READY',
  items: [],
  timeline: [],
  userId: 'user-1'
};

describe('notifications/push', () => {
  describe('buildOrderStatusNotification', () => {
    it('returns null for statuses without templates', () => {
      const notification = buildOrderStatusNotification({ ...baseOrder, status: 'NEW' });

      expect(notification).toBeNull();
    });

    it('builds a localized notification using the provided language', () => {
      const notification = buildOrderStatusNotification(baseOrder, { language: 'en' });

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('Order is ready for pickup');
      expect(notification?.data.statusLabel).toBe('Ready');
    });

    it('falls back to default language when locale is missing', () => {
      const notification = buildOrderStatusNotification(baseOrder);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('Заказ готов к выдаче');
      expect(notification?.data.statusLabel).toBe('Готов');
    });

    it('normalizes locale string before lookup', () => {
      const notification = buildOrderStatusNotification(baseOrder, { language: 'en-US' });

      expect(notification?.title).toBe('Order is ready for pickup');
    });
  });
});
