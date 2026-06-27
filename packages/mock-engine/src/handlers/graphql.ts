import { graphql, HttpResponse, delay } from 'msw';

import { generateCurrencyAllocations } from '../generators/currency-allocation.js';
import { generateStockBalances } from '../generators/stock-balance.js';
import { generateTransactions } from '../generators/transaction-entry.js';
import { withTraceHeaders } from '../middleware/index.js';

import type { StockBalance, CurrencyAllocation, TransactionEntry } from '../contracts/index.js';

/**
 * Configuration for GraphQL handler behavior.
 */
export interface GraphQLHandlerConfig {
  /** Error injection rate (0.0 - 1.0), default 0.05 */
  errorRate: number;
  /** Minimum simulated latency in ms, default 100 */
  minLatencyMs: number;
  /** Maximum simulated latency in ms, default 2000 */
  maxLatencyMs: number;
}

const defaultConfig: GraphQLHandlerConfig = {
  errorRate: 0.05,
  minLatencyMs: 100,
  maxLatencyMs: 2000,
};

/**
 * Extracts field names requested in a GraphQL query from the query string.
 * Parses the selection set for a given root field to determine which fields
 * were requested, so we only return those fields in the response.
 */
function extractRequestedFields(query: string, rootField: string): string[] | null {
  // Find the root field's selection set in the query string
  const rootPattern = new RegExp(`${rootField}\\s*\\{([^}]+)\\}`, 's');
  const match = query.match(rootPattern);
  if (!match || !match[1]) {
    return null; // Return all fields if we can't parse
  }

  // Extract field names (strip aliases, arguments, etc.)
  const selectionSet = match[1];
  const fields = selectionSet
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      // Handle aliases: "alias: fieldName" → use fieldName
      const aliasMatch = line.match(/^\w+\s*:\s*(\w+)/);
      if (aliasMatch) return aliasMatch[1];
      // Handle field with arguments: "field(arg: val)" → use field
      const argMatch = line.match(/^(\w+)\s*\(/);
      if (argMatch) return argMatch[1];
      // Simple field name
      const simpleMatch = line.match(/^(\w+)/);
      return simpleMatch ? simpleMatch[1] : null;
    })
    .filter((f): f is string => f !== null);

  return fields.length > 0 ? fields : null;
}

/**
 * Filters an object to only include the specified fields.
 * If requestedFields is null, returns the full object (as a plain record).
 */
function filterFields<T extends object>(
  obj: T,
  requestedFields: string[] | null,
): Record<string, unknown> {
  const source = obj as Record<string, unknown>;
  if (!requestedFields) return { ...source };
  const filtered: Record<string, unknown> = {};
  for (const field of requestedFields) {
    if (field in source) {
      filtered[field] = source[field];
    }
  }
  return filtered;
}

/**
 * Applies simulated latency between min and max ms (uniform distribution).
 */
function simulateLatency(config: GraphQLHandlerConfig): Promise<void> {
  const delayMs =
    Math.floor(Math.random() * (config.maxLatencyMs - config.minLatencyMs + 1)) +
    config.minLatencyMs;
  return delay(delayMs) as Promise<void>;
}

/**
 * Determines if this request should return an error based on the configured rate.
 */
function shouldInjectError(config: GraphQLHandlerConfig): boolean {
  return Math.random() < config.errorRate;
}

/**
 * Creates MSW GraphQL handlers for the Mock_Engine.
 * Supports queries for stockBalances, currencyAllocations, and transactions.
 *
 * Responses conform to the requested query schema — only fields present in the
 * query selection set are included in the response data.
 */
export function createGraphQLHandlers(config: Partial<GraphQLHandlerConfig> = {}) {
  const resolvedConfig: GraphQLHandlerConfig = { ...defaultConfig, ...config };

  return [
    graphql.query('StockBalances', async ({ query }) => {
      await simulateLatency(resolvedConfig);

      if (shouldInjectError(resolvedConfig)) {
        return HttpResponse.json({
          errors: [{ message: 'Failed to fetch stock balances', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
        }, { headers: withTraceHeaders() });
      }

      const data: StockBalance[] = generateStockBalances();
      const requestedFields = extractRequestedFields(query, 'stockBalances');
      const filteredData = data.map((item) => filterFields(item, requestedFields));

      return HttpResponse.json({
        data: { stockBalances: filteredData },
      }, { headers: withTraceHeaders() });
    }),

    graphql.query('CurrencyAllocations', async ({ query }) => {
      await simulateLatency(resolvedConfig);

      if (shouldInjectError(resolvedConfig)) {
        return HttpResponse.json({
          errors: [{ message: 'Failed to fetch currency allocations', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
        }, { headers: withTraceHeaders() });
      }

      const data: CurrencyAllocation[] = generateCurrencyAllocations();
      const requestedFields = extractRequestedFields(query, 'currencyAllocations');
      const filteredData = data.map((item) => filterFields(item, requestedFields));

      return HttpResponse.json({
        data: { currencyAllocations: filteredData },
      }, { headers: withTraceHeaders() });
    }),

    graphql.query('Transactions', async ({ query, variables }) => {
      await simulateLatency(resolvedConfig);

      if (shouldInjectError(resolvedConfig)) {
        return HttpResponse.json({
          errors: [{ message: 'Failed to fetch transactions', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
        }, { headers: withTraceHeaders() });
      }

      const page = (variables?.['page'] as number) ?? 1;
      const pageSize = (variables?.['pageSize'] as number) ?? 20;

      const allTransactions: TransactionEntry[] = generateTransactions(50);
      const start = (page - 1) * pageSize;
      const paginatedData = allTransactions.slice(start, start + pageSize);

      const requestedFields = extractRequestedFields(query, 'transactions');
      const filteredData = paginatedData.map((item) => filterFields(item, requestedFields));

      return HttpResponse.json({
        data: {
          transactions: {
            data: filteredData,
            pagination: {
              page,
              pageSize,
              totalItems: allTransactions.length,
              totalPages: Math.ceil(allTransactions.length / pageSize),
            },
          },
        },
      }, { headers: withTraceHeaders() });
    }),

    graphql.mutation('CreateTransaction', async ({ query, variables }) => {
      await simulateLatency(resolvedConfig);

      if (shouldInjectError(resolvedConfig)) {
        return HttpResponse.json({
          errors: [{ message: 'Failed to create transaction', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
        }, { headers: withTraceHeaders() });
      }

      const transaction = {
        transactionId: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        type: (variables?.['type'] as string) ?? 'buy',
        asset: (variables?.['asset'] as string) ?? 'AAPL',
        amount: (variables?.['amount'] as number) ?? 100.0,
        status: 'pending' as const,
      };

      const requestedFields = extractRequestedFields(query, 'createTransaction');
      const filteredTransaction = filterFields(transaction, requestedFields);

      return HttpResponse.json({
        data: { createTransaction: filteredTransaction },
      }, { headers: withTraceHeaders() });
    }),
  ];
}

/**
 * Default GraphQL handlers with standard configuration.
 */
export const graphqlHandlers = createGraphQLHandlers();
