import { setupServer } from 'msw/node';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

import { createGraphQLHandlers } from './graphql.js';

const handlers = createGraphQLHandlers({ errorRate: 0, minLatencyMs: 0, maxLatencyMs: 0 });
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GraphQL Handlers', () => {
  describe('StockBalances query', () => {
    it('returns stock balance data matching StockBalance interface', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query StockBalances {
            stockBalances {
              ticker
              quantity
              currentPrice
              totalValue
            }
          }`,
        }),
      });

      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.stockBalances).toBeInstanceOf(Array);
      expect(json.data.stockBalances.length).toBeGreaterThanOrEqual(1);

      for (const balance of json.data.stockBalances) {
        expect(balance).toHaveProperty('ticker');
        expect(balance).toHaveProperty('quantity');
        expect(balance).toHaveProperty('currentPrice');
        expect(balance).toHaveProperty('totalValue');
        expect(typeof balance.ticker).toBe('string');
        expect(typeof balance.quantity).toBe('number');
        expect(typeof balance.currentPrice).toBe('number');
        expect(typeof balance.totalValue).toBe('number');
      }
    });

    it('only returns requested fields — no extra fields', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query StockBalances {
            stockBalances {
              ticker
              currentPrice
            }
          }`,
        }),
      });

      const json = await response.json();
      expect(json.data.stockBalances.length).toBeGreaterThanOrEqual(1);

      for (const balance of json.data.stockBalances) {
        expect(Object.keys(balance).sort()).toEqual(['currentPrice', 'ticker']);
        expect(balance).not.toHaveProperty('quantity');
        expect(balance).not.toHaveProperty('totalValue');
      }
    });
  });

  describe('CurrencyAllocations query', () => {
    it('returns currency allocation data matching CurrencyAllocation interface', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query CurrencyAllocations {
            currencyAllocations {
              currencyCode
              allocationPercentage
              absoluteValue
            }
          }`,
        }),
      });

      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.currencyAllocations).toBeInstanceOf(Array);
      expect(json.data.currencyAllocations.length).toBeGreaterThanOrEqual(1);

      for (const allocation of json.data.currencyAllocations) {
        expect(typeof allocation.currencyCode).toBe('string');
        expect(allocation.currencyCode).toMatch(/^[A-Z]{3}$/);
        expect(typeof allocation.allocationPercentage).toBe('number');
        expect(typeof allocation.absoluteValue).toBe('number');
      }
    });

    it('only returns requested fields for currency allocations', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query CurrencyAllocations {
            currencyAllocations {
              currencyCode
            }
          }`,
        }),
      });

      const json = await response.json();
      for (const allocation of json.data.currencyAllocations) {
        expect(Object.keys(allocation)).toEqual(['currencyCode']);
      }
    });
  });

  describe('Transactions query', () => {
    it('returns transaction data matching TransactionEntry interface', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query Transactions {
            transactions {
              transactionId
              timestamp
              type
              asset
              amount
              status
            }
          }`,
          variables: { page: 1, pageSize: 5 },
        }),
      });

      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.transactions.data).toBeInstanceOf(Array);
      expect(json.data.transactions.pagination).toBeDefined();

      for (const txn of json.data.transactions.data) {
        expect(typeof txn.transactionId).toBe('string');
        expect(txn.transactionId.length).toBeGreaterThan(0);
        expect(typeof txn.timestamp).toBe('string');
        expect(['buy', 'sell', 'transfer']).toContain(txn.type);
        expect(typeof txn.asset).toBe('string');
        expect(typeof txn.amount).toBe('number');
        expect(['pending', 'completed', 'failed']).toContain(txn.status);
      }
    });

    it('only returns requested fields for transactions', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query Transactions {
            transactions {
              transactionId
              amount
            }
          }`,
          variables: { page: 1, pageSize: 3 },
        }),
      });

      const json = await response.json();
      for (const txn of json.data.transactions.data) {
        expect(Object.keys(txn).sort()).toEqual(['amount', 'transactionId']);
      }
    });

    it('includes pagination metadata', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query Transactions {
            transactions {
              transactionId
            }
          }`,
          variables: { page: 1, pageSize: 10 },
        }),
      });

      const json = await response.json();
      const { pagination } = json.data.transactions;
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(10);
      expect(pagination.totalItems).toBeGreaterThan(0);
      expect(pagination.totalPages).toBeGreaterThan(0);
    });
  });

  describe('CreateTransaction mutation', () => {
    it('creates a transaction and returns requested fields', async () => {
      const response = await fetch('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation CreateTransaction {
            createTransaction {
              transactionId
              status
            }
          }`,
          variables: { type: 'buy', asset: 'MSFT', amount: 250.00 },
        }),
      });

      const json = await response.json();
      expect(json.data.createTransaction).toBeDefined();
      expect(Object.keys(json.data.createTransaction).sort()).toEqual(['status', 'transactionId']);
      expect(json.data.createTransaction.status).toBe('pending');
      expect(json.data.createTransaction.transactionId).toBeTruthy();
    });
  });
});
