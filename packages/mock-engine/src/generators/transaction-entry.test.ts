import { describe, it, expect } from 'vitest';

import {
  generateTransactions,
  generateTransactionLedgerResponse,
} from './transaction-entry.js';

describe('transaction-entry generator', () => {
  describe('generateTransactions', () => {
    it('generates 1-50 entries when no count specified', () => {
      for (let i = 0; i < 10; i++) {
        const entries = generateTransactions();
        expect(entries.length).toBeGreaterThanOrEqual(1);
        expect(entries.length).toBeLessThanOrEqual(50);
      }
    });

    it('generates exact count when specified', () => {
      const entries = generateTransactions(15);
      expect(entries).toHaveLength(15);
    });

    it('all transactionIds are unique', () => {
      const entries = generateTransactions(50);
      const ids = entries.map((e) => e.transactionId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('transactionId is non-empty', () => {
      const entries = generateTransactions(10);
      for (const entry of entries) {
        expect(entry.transactionId.length).toBeGreaterThan(0);
      }
    });

    it('timestamp is valid ISO 8601', () => {
      const entries = generateTransactions(10);
      for (const entry of entries) {
        const parsed = new Date(entry.timestamp);
        expect(parsed.toISOString()).toBe(entry.timestamp);
      }
    });

    it('entries are ordered by timestamp descending', () => {
      const entries = generateTransactions(20);
      for (let i = 1; i < entries.length; i++) {
        const prev = new Date(entries[i - 1]!.timestamp).getTime();
        const curr = new Date(entries[i]!.timestamp).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });

    it('type is one of buy, sell, transfer', () => {
      const entries = generateTransactions(30);
      const validTypes = ['buy', 'sell', 'transfer'];
      for (const entry of entries) {
        expect(validTypes).toContain(entry.type);
      }
    });

    it('asset is 1-5 uppercase letters', () => {
      const entries = generateTransactions(20);
      for (const entry of entries) {
        expect(entry.asset).toMatch(/^[A-Z]{1,5}$/);
      }
    });

    it('amount >= 0.01 with 2 decimal places', () => {
      const entries = generateTransactions(20);
      for (const entry of entries) {
        expect(entry.amount).toBeGreaterThanOrEqual(0.01);
        expect(Math.round(entry.amount * 100) / 100).toBe(entry.amount);
      }
    });

    it('status is one of pending, completed, failed', () => {
      const entries = generateTransactions(30);
      const validStatuses = ['pending', 'completed', 'failed'];
      for (const entry of entries) {
        expect(validStatuses).toContain(entry.status);
      }
    });
  });

  describe('generateTransactionLedgerResponse', () => {
    it('returns response with data, pagination, and timestamp', () => {
      const response = generateTransactionLedgerResponse();
      expect(response.data).toBeDefined();
      expect(response.pagination).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    it('pagination has correct shape', () => {
      const response = generateTransactionLedgerResponse(1, 10);
      expect(response.pagination.page).toBeGreaterThanOrEqual(1);
      expect(response.pagination.pageSize).toBe(10);
      expect(response.pagination.totalItems).toBeGreaterThanOrEqual(1);
      expect(response.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('data length does not exceed pageSize', () => {
      const response = generateTransactionLedgerResponse(1, 5);
      expect(response.data.length).toBeLessThanOrEqual(5);
    });

    it('entries are ordered by timestamp DESC', () => {
      const response = generateTransactionLedgerResponse(1, 20);
      for (let i = 1; i < response.data.length; i++) {
        const prev = new Date(response.data[i - 1]!.timestamp).getTime();
        const curr = new Date(response.data[i]!.timestamp).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });
});
