import { describe, it, expect } from 'vitest';

import {
  generateCurrencyAllocations,
  generateCurrencyAllocationResponse,
} from './currency-allocation.js';

describe('currency-allocation generator', () => {
  describe('generateCurrencyAllocations', () => {
    it('generates between 2-9 items when no count specified', () => {
      for (let i = 0; i < 20; i++) {
        const items = generateCurrencyAllocations();
        expect(items.length).toBeGreaterThanOrEqual(2);
        expect(items.length).toBeLessThanOrEqual(10);
      }
    });

    it('currency codes match /^[A-Z]{3}$/', () => {
      const items = generateCurrencyAllocations(5);
      for (const item of items) {
        expect(item.currencyCode).toMatch(/^[A-Z]{3}$/);
      }
    });

    it('allocationPercentage is between 0.01 and 100.00', () => {
      const items = generateCurrencyAllocations(5);
      for (const item of items) {
        expect(item.allocationPercentage).toBeGreaterThanOrEqual(0.01);
        expect(item.allocationPercentage).toBeLessThanOrEqual(100.0);
      }
    });

    it('percentages sum to exactly 100.00', () => {
      for (let i = 0; i < 50; i++) {
        const items = generateCurrencyAllocations();
        const sum = items.reduce((acc, item) => acc + item.allocationPercentage, 0);
        // Use rounding to avoid floating-point precision issues in the assertion
        expect(Math.round(sum * 100) / 100).toBe(100.0);
      }
    });

    it('absoluteValue is >= 0.01 with 2 decimal places', () => {
      const items = generateCurrencyAllocations(5);
      for (const item of items) {
        expect(item.absoluteValue).toBeGreaterThanOrEqual(0.01);
        expect(Math.round(item.absoluteValue * 100) / 100).toBe(item.absoluteValue);
      }
    });
  });

  describe('generateCurrencyAllocationResponse', () => {
    it('returns response with data and timestamp', () => {
      const response = generateCurrencyAllocationResponse();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.timestamp).toBeDefined();
    });

    it('timestamp is valid ISO 8601', () => {
      const response = generateCurrencyAllocationResponse();
      const parsed = new Date(response.timestamp);
      expect(parsed.toISOString()).toBe(response.timestamp);
    });

    it('response data percentages sum to 100.00', () => {
      const response = generateCurrencyAllocationResponse();
      const sum = response.data.reduce((acc, item) => acc + item.allocationPercentage, 0);
      expect(Math.round(sum * 100) / 100).toBe(100.0);
    });
  });
});
