import type {
  TransactionEntry,
  PaginationMeta,
  TransactionLedgerResponse,
} from '../contracts/index.js';

const TRANSACTION_TYPES: TransactionEntry['type'][] = ['buy', 'sell', 'transfer'];
const TRANSACTION_STATUSES: TransactionEntry['status'][] = ['pending', 'completed', 'failed'];
const ASSETS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'BTC', 'ETH', 'SOL', 'XRP', 'ADA'];

let idCounter = 0;

/**
 * Generates a unique transaction ID.
 */
function generateTransactionId(): string {
  idCounter++;
  return `txn-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generates a random ISO 8601 timestamp within the last 30 days.
 */
function randomTimestamp(baseTime: number): string {
  const offset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
  return new Date(baseTime - offset).toISOString();
}

/**
 * Generates transaction entries ordered by timestamp descending.
 * Returns 1-50 entries.
 */
export function generateTransactions(count?: number): TransactionEntry[] {
  const numItems = count ?? Math.floor(Math.random() * 50) + 1;
  const now = Date.now();

  const entries: TransactionEntry[] = Array.from({ length: numItems }, () => ({
    transactionId: generateTransactionId(),
    timestamp: randomTimestamp(now),
    type: TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)]!,
    asset: ASSETS[Math.floor(Math.random() * ASSETS.length)]!,
    amount: Math.round((Math.random() * 9999.98 + 0.01) * 100) / 100,
    status: TRANSACTION_STATUSES[Math.floor(Math.random() * TRANSACTION_STATUSES.length)]!,
  }));

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return entries;
}

/**
 * Generates a TransactionLedgerResponse with pagination.
 */
export function generateTransactionLedgerResponse(
  page: number = 1,
  pageSize: number = 20,
): TransactionLedgerResponse {
  const totalItems = Math.floor(Math.random() * 50) + 1; // 1-50
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.min(Math.max(1, page), totalPages);

  // Calculate how many items on this page
  const startIndex = (currentPage - 1) * pageSize;
  const itemsOnPage = Math.min(pageSize, totalItems - startIndex);

  const entries = generateTransactions(itemsOnPage);

  const pagination: PaginationMeta = {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
  };

  return {
    data: entries,
    pagination,
    timestamp: new Date().toISOString(),
  };
}
