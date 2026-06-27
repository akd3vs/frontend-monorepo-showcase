import { describe, it, expect } from 'vitest';

import { generateStockBalances, generateStockBalanceResponse } from './stock-balance.js';

describe('stock-balance generator', () => {
  describe('generateStockBalances', () => {
    it('generates items within 1-20 range when no count specified', () => {
      for (let i = 0; i < 20; i++) {
        const items = generateStockBalances();
        expect(items.length).toBeGreaterThanOrEqual(1);
        expect(items.length).toBeLessThanOrEqual(20);
      }
    });

    it('generates the exact count when specified', () => {
      const items = generateStockBalances(5);
      expect(items).toHaveLength(5);
    });

    it('generates unique tickers', () => {
      const items = generateStockBalances(10);
      const tickers = items.map((i) => i.ticker);
      expect(new Set(tickers).size).toBe(tickers.length);
    });

    it('tickers match /^[A-Z]{1,5}$/', () => {
      const items = generateStockBalances(20);
      for (const item of items) {
        expect(item.ticker).toMatch(/^[A-Z]{1,5}$/);
      }
    });

    it('quantity is integer >= 1', () => {
      const items = generateStockBalances(10);
      for (const item of items) {
        expect(Number.isInteger(item.quantity)).toBe(true);
        expect(item.quantity).toBeGreaterThanOrEqual(1);
      }
    });

    it('currentPrice is between 0.01 and 999999.99 with 2 decimals', () => {
      const items = generateStockBalances(10);
      for (const item of items) {
        expect(item.currentPrice).toBeGreaterThanOrEqual(0.01);
        expect(item.currentPrice).toBeLessThanOrEqual(999999.99);
        // Check 2 decimal places
        expect(Math.round(item.currentPrice * 100) / 100).toBe(item.currentPrice);
      }
    });

    it('totalValue = quantity * currentPrice (2 decimal places)', () => {
      const items = generateStockBalances(10);
      for (const item of items) {
        const expected = Math.round(item.quantity * item.currentPrice * 100) / 100;
        expect(item.totalValue).toBe(expected);
      }
    });
  });

  describe('generateStockBalanceResponse', () => {
    it('returns response with data and timestamp', () => {
      const response = generateStockBalanceResponse();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
      expect(response.data.length).toBeLessThanOrEqual(20);
      expect(response.timestamp).toBeDefined();
    });

    it('timestamp is valid ISO 8601', () => {
      const response = generateStockBalanceResponse();
      const parsed = new Date(response.timestamp);
      expect(parsed.toISOString()).toBe(response.timestamp);
    });
  });
});
