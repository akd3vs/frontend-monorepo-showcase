// Mock Engine package entry point

// Data contracts (types)
export type {
  StockBalance,
  StockBalanceResponse,
  CurrencyAllocation,
  CurrencyAllocationResponse,
  TransactionEntry,
  PaginationMeta,
  TransactionLedgerResponse,
  MockErrorResponse,
} from './contracts/index.js';

// Configuration
export type { MockEngineConfig } from './config.js';
export { DEFAULT_CONFIG, resolveConfig } from './config.js';

// Generators
export {
  generateStockBalances,
  generateStockBalanceResponse,
} from './generators/stock-balance.js';
export {
  generateCurrencyAllocations,
  generateCurrencyAllocationResponse,
} from './generators/currency-allocation.js';
export {
  generateTransactions,
  generateTransactionLedgerResponse,
} from './generators/transaction-entry.js';

// Handlers
export { createRestHandlers, createFallbackHandler } from './handlers/rest.js';
export { graphqlHandlers, createGraphQLHandlers } from './handlers/graphql.js';
export type { GraphQLHandlerConfig } from './handlers/graphql.js';

// Middleware
export {
  generateHex,
  generateTraceparent,
  generateTracestate,
  injectTraceHeaders,
  withTraceHeaders,
  isValidTraceparent,
  TRACEPARENT_REGEX,
} from './middleware/index.js';

// Setup
export { setupMockEngine } from './setup.js';
