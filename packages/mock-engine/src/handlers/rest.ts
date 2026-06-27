import { http, HttpResponse, delay } from 'msw';

import { generateCurrencyAllocationResponse } from '../generators/currency-allocation.js';
import { generateStockBalanceResponse } from '../generators/stock-balance.js';
import { generateTransactionLedgerResponse } from '../generators/transaction-entry.js';
import { withTraceHeaders } from '../middleware/index.js';

import type { MockEngineConfig } from '../config.js';
import type { MockErrorResponse } from '../contracts/index.js';

/**
 * Generates a unique request ID for error responses.
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Simulates latency by delaying for a random duration within configured bounds.
 */
async function simulateLatency(config: MockEngineConfig): Promise<void> {
  const latency =
    Math.floor(
      Math.random() * (config.maxLatencyMs - config.minLatencyMs + 1),
    ) + config.minLatencyMs;
  await delay(latency);
}

/**
 * Rolls for error injection. Returns an error response if triggered, null otherwise.
 */
function rollForError(config: MockEngineConfig): MockErrorResponse | null {
  if (Math.random() < config.errorRate) {
    const statusCode = Math.random() < 0.5 ? 401 : 500;
    const message =
      statusCode === 401
        ? 'Unauthorized: Invalid or expired token'
        : 'Internal Server Error: Service temporarily unavailable';

    return {
      error: {
        code: statusCode,
        message,
        requestId: generateRequestId(),
      },
    };
  }
  return null;
}

/**
 * Creates MSW REST handlers for the mock API endpoints.
 */
export function createRestHandlers(config: MockEngineConfig) {
  return [
    // GET /api/stocks
    http.get('*/api/stocks', async () => {
      await simulateLatency(config);

      const error = rollForError(config);
      if (error) {
        return HttpResponse.json(error, {
          status: error.error.code,
          headers: withTraceHeaders(),
        });
      }

      const response = generateStockBalanceResponse();
      return HttpResponse.json(response, {
        headers: withTraceHeaders(),
      });
    }),

    // GET /api/currencies
    http.get('*/api/currencies', async () => {
      await simulateLatency(config);

      const error = rollForError(config);
      if (error) {
        return HttpResponse.json(error, {
          status: error.error.code,
          headers: withTraceHeaders(),
        });
      }

      const response = generateCurrencyAllocationResponse();
      return HttpResponse.json(response, {
        headers: withTraceHeaders(),
      });
    }),

    // GET /api/transactions
    http.get('*/api/transactions', async ({ request }) => {
      await simulateLatency(config);

      const error = rollForError(config);
      if (error) {
        return HttpResponse.json(error, {
          status: error.error.code,
          headers: withTraceHeaders(),
        });
      }

      const url = new URL(request.url);
      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
      const pageSize = Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10));

      const response = generateTransactionLedgerResponse(page, pageSize);
      return HttpResponse.json(response, {
        headers: withTraceHeaders(),
      });
    }),
  ];
}

/**
 * Creates a fallback handler that returns 404 for unmatched API requests
 * and logs a warning if logging is enabled.
 * Only catches /api/* requests — everything else passes through to the dev server.
 */
export function createFallbackHandler(config: MockEngineConfig) {
  return http.all('*/api/*', ({ request }) => {
    if (config.enableLogging) {
      const url = new URL(request.url);
      console.warn(
        `[MockEngine] Unmatched request: ${request.method} ${url.pathname}${url.search}`,
      );
    }

    const errorResponse: MockErrorResponse = {
      error: {
        code: 404,
        message: 'Not Found: The requested endpoint does not exist',
        requestId: generateRequestId(),
      },
    };

    return HttpResponse.json(errorResponse, {
      status: 404,
      headers: withTraceHeaders(),
    });
  });
}
