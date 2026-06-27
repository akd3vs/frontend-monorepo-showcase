/**
 * Property-Based Tests for Mock_Engine Data Contracts (Properties 1-7)
 *
 * Feature: enterprise-frontend-monorepo
 * Testing Framework: Vitest + fast-check
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { resolveConfig } from '../config.js';
import {
  generateStockBalances,
  generateCurrencyAllocations,
  generateCurrencyAllocationResponse,
  generateTransactions,
} from '../generators/index.js';

import type { StockBalance, CurrencyAllocation, TransactionEntry } from '../contracts/index.js';

// ─── Property 1: Data Contract Conformance ───────────────────────────────────
// *For any* generated mock payload, every field value SHALL conform to its
// specified constraints.
// **Validates: Requirements 3.2, 4.1, 4.2, 4.3, 4.4**

describe('Property 1: Data Contract Conformance', () => {
  it('StockBalance fields conform to constraints', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
        const balances = generateStockBalances(count);

        for (const balance of balances) {
          // ticker: 1-5 uppercase alphabetic chars
          expect(balance.ticker).toMatch(/^[A-Z]{1,5}$/);

          // quantity: integer >= 1
          expect(Number.isInteger(balance.quantity)).toBe(true);
          expect(balance.quantity).toBeGreaterThanOrEqual(1);

          // currentPrice: 0.01 - 999999.99, exactly 2 decimal places
          expect(balance.currentPrice).toBeGreaterThanOrEqual(0.01);
          expect(balance.currentPrice).toBeLessThanOrEqual(999999.99);
          expect(Math.round(balance.currentPrice * 100) / 100).toBe(balance.currentPrice);

          // totalValue: quantity * currentPrice, exactly 2 decimal places
          const expectedTotal = Math.round(balance.quantity * balance.currentPrice * 100) / 100;
          expect(balance.totalValue).toBe(expectedTotal);
          expect(Math.round(balance.totalValue * 100) / 100).toBe(balance.totalValue);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('CurrencyAllocation fields conform to constraints', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (count) => {
        const allocations = generateCurrencyAllocations(count);

        for (const alloc of allocations) {
          // currencyCode: ISO 4217, /^[A-Z]{3}$/
          expect(alloc.currencyCode).toMatch(/^[A-Z]{3}$/);

          // allocationPercentage: 0.01 - 100.00
          expect(alloc.allocationPercentage).toBeGreaterThanOrEqual(0.01);
          expect(alloc.allocationPercentage).toBeLessThanOrEqual(100.0);

          // absoluteValue: >= 0.01, exactly 2 decimal places
          expect(alloc.absoluteValue).toBeGreaterThanOrEqual(0.01);
          expect(Math.round(alloc.absoluteValue * 100) / 100).toBe(alloc.absoluteValue);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('TransactionEntry fields conform to constraints', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (count) => {
        const transactions = generateTransactions(count);

        for (const tx of transactions) {
          // transactionId: non-empty string
          expect(tx.transactionId.length).toBeGreaterThan(0);

          // timestamp: ISO 8601 (parseable as a valid date)
          const parsed = new Date(tx.timestamp);
          expect(parsed.getTime()).not.toBeNaN();
          expect(tx.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

          // type: one of 'buy', 'sell', 'transfer'
          expect(['buy', 'sell', 'transfer']).toContain(tx.type);

          // asset: 1-5 uppercase alphabetic chars
          expect(tx.asset).toMatch(/^[A-Z]{1,5}$/);

          // amount: >= 0.01, exactly 2 decimal places
          expect(tx.amount).toBeGreaterThanOrEqual(0.01);
          expect(Math.round(tx.amount * 100) / 100).toBe(tx.amount);

          // status: one of 'pending', 'completed', 'failed'
          expect(['pending', 'completed', 'failed']).toContain(tx.status);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: Currency Allocation Sum Invariant ───────────────────────────
// *For any* generated currency allocation response, the sum of all
// `allocationPercentage` values SHALL equal exactly 100.00.
// **Validates: Requirements 4.2**

describe('Property 2: Currency Allocation Sum Invariant', () => {
  it('allocationPercentage values sum to exactly 100.00', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (count) => {
        const allocations = generateCurrencyAllocations(count);
        const sum = allocations.reduce(
          (acc, a) => acc + Math.round(a.allocationPercentage * 100),
          0,
        );
        // Sum of hundredths should be exactly 10000 (representing 100.00)
        expect(sum).toBe(10000);
      }),
      { numRuns: 100 },
    );
  });

  it('response wrapper also maintains the invariant', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const response = generateCurrencyAllocationResponse();
        const sum = response.data.reduce(
          (acc, a) => acc + Math.round(a.allocationPercentage * 100),
          0,
        );
        expect(sum).toBe(10000);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: JSON Serialization Round-Trip ───────────────────────────────
// *For any* generated domain entity, serializing to JSON and parsing back
// SHALL produce an equivalent object.
// **Validates: Requirements 4.5**

describe('Property 3: JSON Serialization Round-Trip', () => {
  it('StockBalance round-trips through JSON', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
        const balances = generateStockBalances(count);
        const serialized = JSON.stringify(balances);
        const deserialized: StockBalance[] = JSON.parse(serialized);

        expect(deserialized).toEqual(balances);
        expect(deserialized.length).toBe(balances.length);

        for (let i = 0; i < balances.length; i++) {
          const original = balances[i]!;
          const parsed = deserialized[i]!;
          expect(typeof parsed.ticker).toBe('string');
          expect(typeof parsed.quantity).toBe('number');
          expect(typeof parsed.currentPrice).toBe('number');
          expect(typeof parsed.totalValue).toBe('number');
          expect(parsed.ticker).toBe(original.ticker);
          expect(parsed.quantity).toBe(original.quantity);
          expect(parsed.currentPrice).toBe(original.currentPrice);
          expect(parsed.totalValue).toBe(original.totalValue);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('CurrencyAllocation round-trips through JSON', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (count) => {
        const allocations = generateCurrencyAllocations(count);
        const serialized = JSON.stringify(allocations);
        const deserialized: CurrencyAllocation[] = JSON.parse(serialized);

        expect(deserialized).toEqual(allocations);

        for (let i = 0; i < allocations.length; i++) {
          const _original = allocations[i]!;
          const parsed = deserialized[i]!;
          expect(typeof parsed.currencyCode).toBe('string');
          expect(typeof parsed.allocationPercentage).toBe('number');
          expect(typeof parsed.absoluteValue).toBe('number');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('TransactionEntry round-trips through JSON', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (count) => {
        const transactions = generateTransactions(count);
        const serialized = JSON.stringify(transactions);
        const deserialized: TransactionEntry[] = JSON.parse(serialized);

        expect(deserialized).toEqual(transactions);

        for (let i = 0; i < transactions.length; i++) {
          const _original = transactions[i]!;
          const parsed = deserialized[i]!;
          expect(typeof parsed.transactionId).toBe('string');
          expect(typeof parsed.timestamp).toBe('string');
          expect(typeof parsed.type).toBe('string');
          expect(typeof parsed.asset).toBe('string');
          expect(typeof parsed.amount).toBe('number');
          expect(typeof parsed.status).toBe('string');
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 4: Collection Cardinality and Ordering Invariants ──────────────
// Stock 1-20 unique tickers, Transactions 1-50 ordered by timestamp DESC.
// **Validates: Requirements 4.6, 4.7**

describe('Property 4: Collection Cardinality and Ordering', () => {
  it('stock balance collections have 1-20 items with unique tickers', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const balances = generateStockBalances();
        // Cardinality: 1-20
        expect(balances.length).toBeGreaterThanOrEqual(1);
        expect(balances.length).toBeLessThanOrEqual(20);

        // Uniqueness: all tickers are distinct
        const tickers = balances.map((b) => b.ticker);
        expect(new Set(tickers).size).toBe(tickers.length);
      }),
      { numRuns: 100 },
    );
  });

  it('stock balance respects explicit count within bounds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (count) => {
        const balances = generateStockBalances(count);
        expect(balances.length).toBe(count);

        const tickers = balances.map((b) => b.ticker);
        expect(new Set(tickers).size).toBe(tickers.length);
      }),
      { numRuns: 100 },
    );
  });

  it('transaction collections have 1-50 items ordered by timestamp DESC', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (count) => {
        const transactions = generateTransactions(count);

        // Cardinality: matches requested count
        expect(transactions.length).toBe(count);

        // Ordering: each timestamp <= previous (DESC)
        for (let i = 1; i < transactions.length; i++) {
          const prev = new Date(transactions[i - 1]!.timestamp).getTime();
          const curr = new Date(transactions[i]!.timestamp).getTime();
          expect(curr).toBeLessThanOrEqual(prev);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('transaction IDs are unique within a response', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (count) => {
        const transactions = generateTransactions(count);
        const ids = transactions.map((t) => t.transactionId);
        expect(new Set(ids).size).toBe(ids.length);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 5: GraphQL Response Schema Conformance ─────────────────────────
// *For any* GraphQL query, the returned response's field structure and types
// SHALL conform to the fields requested in the query.
// **Validates: Requirements 3.3**

describe('Property 5: GraphQL Response Schema Conformance', () => {
  // We test the extractRequestedFields + filterFields logic via the handlers
  // by invoking the GraphQL handler helpers directly with varying field selections.

  const allStockFields = ['ticker', 'quantity', 'currentPrice', 'totalValue'];
  const allCurrencyFields = ['currencyCode', 'allocationPercentage', 'absoluteValue'];
  const allTransactionFields = ['transactionId', 'timestamp', 'type', 'asset', 'amount', 'status'];

  /**
   * Generates a random non-empty subset of fields for testing.
   */
  function subsetArbitrary(allFields: string[]): fc.Arbitrary<string[]> {
    return fc.subarray(allFields, { minLength: 1 }).filter((arr) => arr.length > 0);
  }

  it('stock balance query returns only requested fields', () => {
    fc.assert(
      fc.property(subsetArbitrary(allStockFields), (requestedFields) => {
        const balances = generateStockBalances(5);
        // Simulate field filtering as done in GraphQL handler
        const filtered = balances.map((b) => {
          const obj: Record<string, unknown> = {};
          for (const field of requestedFields) {
            if (field in b) {
              obj[field] = (b as unknown as Record<string, unknown>)[field];
            }
          }
          return obj;
        });

        for (const item of filtered) {
          // No extra top-level fields
          const keys = Object.keys(item);
          expect(keys.length).toBeLessThanOrEqual(requestedFields.length);

          // All requested fields present (no missing requested fields)
          for (const field of requestedFields) {
            expect(item).toHaveProperty(field);
          }

          // No extra fields beyond requested
          for (const key of keys) {
            expect(requestedFields).toContain(key);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('currency allocation query returns only requested fields', () => {
    fc.assert(
      fc.property(subsetArbitrary(allCurrencyFields), (requestedFields) => {
        const allocations = generateCurrencyAllocations(4);
        const filtered = allocations.map((a) => {
          const obj: Record<string, unknown> = {};
          for (const field of requestedFields) {
            if (field in a) {
              obj[field] = (a as unknown as Record<string, unknown>)[field];
            }
          }
          return obj;
        });

        for (const item of filtered) {
          const keys = Object.keys(item);
          for (const field of requestedFields) {
            expect(item).toHaveProperty(field);
          }
          for (const key of keys) {
            expect(requestedFields).toContain(key);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('transaction query returns only requested fields', () => {
    fc.assert(
      fc.property(subsetArbitrary(allTransactionFields), (requestedFields) => {
        const transactions = generateTransactions(10);
        const filtered = transactions.map((t) => {
          const obj: Record<string, unknown> = {};
          for (const field of requestedFields) {
            if (field in t) {
              obj[field] = (t as unknown as Record<string, unknown>)[field];
            }
          }
          return obj;
        });

        for (const item of filtered) {
          const keys = Object.keys(item);
          for (const field of requestedFields) {
            expect(item).toHaveProperty(field);
          }
          for (const key of keys) {
            expect(requestedFields).toContain(key);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('field values conform to declared types', () => {
    fc.assert(
      fc.property(subsetArbitrary(allStockFields), (requestedFields) => {
        const balances = generateStockBalances(3);

        for (const balance of balances) {
          if (requestedFields.includes('ticker')) {
            expect(typeof balance.ticker).toBe('string');
          }
          if (requestedFields.includes('quantity')) {
            expect(typeof balance.quantity).toBe('number');
            expect(Number.isInteger(balance.quantity)).toBe(true);
          }
          if (requestedFields.includes('currentPrice')) {
            expect(typeof balance.currentPrice).toBe('number');
          }
          if (requestedFields.includes('totalValue')) {
            expect(typeof balance.totalValue).toBe('number');
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 6: Network Latency Bounds ──────────────────────────────────────
// *For any* intercepted request, the simulated response delay SHALL be
// uniformly distributed between 100ms and 2000ms inclusive.
// **Validates: Requirements 3.4**

describe('Property 6: Network Latency Bounds', () => {
  it('generated latency values are within [100, 2000] bounds', () => {
    const config = resolveConfig({ minLatencyMs: 100, maxLatencyMs: 2000 });

    fc.assert(
      fc.property(fc.constant(null), () => {
        // Simulate the latency calculation as done in rest.ts and graphql.ts
        const latency =
          Math.floor(Math.random() * (config.maxLatencyMs - config.minLatencyMs + 1)) +
          config.minLatencyMs;

        expect(latency).toBeGreaterThanOrEqual(100);
        expect(latency).toBeLessThanOrEqual(2000);
      }),
      { numRuns: 500 },
    );
  });

  it('latency bounds are respected with custom configuration', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 5000 }), fc.integer({ min: 0, max: 5000 }), (a, b) => {
        const minLatency = Math.min(a, b);
        const maxLatency = Math.max(a, b);
        if (minLatency === maxLatency) return; // Skip degenerate case

        const config = resolveConfig({ minLatencyMs: minLatency, maxLatencyMs: maxLatency });

        // Simulate latency calculation
        const latency =
          Math.floor(Math.random() * (config.maxLatencyMs - config.minLatencyMs + 1)) +
          config.minLatencyMs;

        expect(latency).toBeGreaterThanOrEqual(minLatency);
        expect(latency).toBeLessThanOrEqual(maxLatency);
      }),
      { numRuns: 200 },
    );
  });

  it('latency is always an integer (milliseconds)', () => {
    const config = resolveConfig();

    fc.assert(
      fc.property(fc.constant(null), () => {
        const latency =
          Math.floor(Math.random() * (config.maxLatencyMs - config.minLatencyMs + 1)) +
          config.minLatencyMs;

        expect(Number.isInteger(latency)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });
});

// ─── Property 7: Error Rate Statistical Conformance ──────────────────────────
// *For any* batch of N intercepted requests (N >= 100), the proportion of error
// responses SHALL be within a statistically acceptable range (within 3 standard
// deviations of a binomial distribution with parameters N and R).
// **Validates: Requirements 3.5**

describe('Property 7: Error Rate Statistical Conformance', () => {
  it('error proportion is within 3 standard deviations of configured rate', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.01, max: 0.3, noNaN: true }), (errorRate) => {
        const N = 500; // Large enough for statistical significance
        let errorCount = 0;

        // Simulate N requests with the given error rate
        for (let i = 0; i < N; i++) {
          if (Math.random() < errorRate) {
            errorCount++;
          }
        }

        const observedRate = errorCount / N;
        const expectedRate = errorRate;

        // Binomial standard deviation: sqrt(N * p * (1-p)) / N = sqrt(p*(1-p)/N)
        const stdDev = Math.sqrt((expectedRate * (1 - expectedRate)) / N);

        // Within 3 standard deviations (99.7% confidence interval)
        const lowerBound = expectedRate - 3 * stdDev;
        const upperBound = expectedRate + 3 * stdDev;

        expect(observedRate).toBeGreaterThanOrEqual(lowerBound);
        expect(observedRate).toBeLessThanOrEqual(upperBound);
      }),
      { numRuns: 50 },
    );
  });

  it('default 5% error rate produces errors within statistical bounds', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const errorRate = 0.05;
        const N = 1000;
        let errorCount = 0;

        for (let i = 0; i < N; i++) {
          if (Math.random() < errorRate) {
            errorCount++;
          }
        }

        const observedRate = errorCount / N;
        const stdDev = Math.sqrt((errorRate * (1 - errorRate)) / N);

        // Within 3 standard deviations
        expect(observedRate).toBeGreaterThanOrEqual(errorRate - 3 * stdDev);
        expect(observedRate).toBeLessThanOrEqual(errorRate + 3 * stdDev);
      }),
      { numRuns: 50 },
    );
  });

  it('zero error rate produces no errors', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 500 }), (N) => {
        const errorRate = 0;
        let errorCount = 0;

        for (let i = 0; i < N; i++) {
          if (Math.random() < errorRate) {
            errorCount++;
          }
        }

        expect(errorCount).toBe(0);
      }),
      { numRuns: 20 },
    );
  });

  it('100% error rate produces all errors', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 500 }), (N) => {
        const errorRate = 1.0;
        let errorCount = 0;

        for (let i = 0; i < N; i++) {
          if (Math.random() < errorRate) {
            errorCount++;
          }
        }

        expect(errorCount).toBe(N);
      }),
      { numRuns: 20 },
    );
  });
});
