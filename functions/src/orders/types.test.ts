import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ORDER_STATUS_LANGUAGE,
  getOrderStatusLabel,
  getOrderStatusLabels,
  type OrderStatus
} from './types';

const SAMPLE_STATUS: OrderStatus = 'READY';

describe('orders/types', () => {
  describe('getOrderStatusLabels', () => {
    it('returns default language labels when language is not provided', () => {
      const labels = getOrderStatusLabels();

      expect(labels[SAMPLE_STATUS]).toBe('Готов');
    });

    it('normalizes locale strings before lookup', () => {
      const labels = getOrderStatusLabels('en-US');

      expect(labels[SAMPLE_STATUS]).toBe('Ready');
    });

    it('falls back to default language for unsupported locales', () => {
      const labels = getOrderStatusLabels('de');

      expect(labels[SAMPLE_STATUS]).toBe('Готов');
    });
  });

  describe('getOrderStatusLabel', () => {
    it('exposes a convenient helper to read a single label', () => {
      expect(getOrderStatusLabel('IN_PROGRESS', 'en')).toBe('In progress');
    });

    it('uses the default language when none is provided', () => {
      expect(DEFAULT_ORDER_STATUS_LANGUAGE).toBe('ru');
      expect(getOrderStatusLabel('CANCELLED')).toBe('Отменён');
    });
  });
});
