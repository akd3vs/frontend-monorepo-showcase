/**
 * Represents a single transaction in the ledger.
 *
 * Constraints:
 * - transactionId: non-empty string, unique within response
 * - timestamp: ISO 8601 UTC format, e.g., "2024-03-15T14:30:00Z"
 * - type: one of 'buy', 'sell', 'transfer'
 * - asset: 1-5 uppercase alphabetic characters
 * - amount: >= 0.01, exactly 2 decimal places
 * - status: one of 'pending', 'completed', 'failed'
 */
export interface TransactionEntry {
  /** Unique transaction identifier (non-empty, unique within response) */
  transactionId: string;
  /** ISO 8601 UTC timestamp of the transaction */
  timestamp: string;
  /** Transaction type */
  type: 'buy' | 'sell' | 'transfer';
  /** Asset ticker symbol (1-5 uppercase letters) */
  asset: string;
  /** Transaction amount (>= 0.01, exactly 2 decimal places) */
  amount: number;
  /** Current transaction status */
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Pagination metadata for paginated responses.
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * API response wrapper for transaction ledger data.
 *
 * Constraints:
 * - data: 1-50 items, ordered by timestamp descending
 * - All transactionIds are unique within the response
 */
export interface TransactionLedgerResponse {
  /** Array of transactions (1-50 items, ordered by timestamp DESC) */
  data: TransactionEntry[];
  /** Pagination metadata */
  pagination: PaginationMeta;
  /** ISO 8601 UTC timestamp of response generation */
  timestamp: string;
}
