/**
 * Represents a single stock holding with its current market value.
 *
 * Constraints:
 * - ticker: 1-5 uppercase alphabetic characters, regex: /^[A-Z]{1,5}$/
 * - quantity: integer >= 1
 * - currentPrice: 0.01 - 999,999.99, exactly 2 decimal places
 * - totalValue: quantity * currentPrice, exactly 2 decimal places
 */
export interface StockBalance {
  /** Stock ticker symbol (1-5 uppercase letters) */
  ticker: string;
  /** Number of shares held (integer >= 1) */
  quantity: number;
  /** Current price per share (0.01 - 999,999.99, 2 decimal places) */
  currentPrice: number;
  /** Total position value: quantity × currentPrice (2 decimal places) */
  totalValue: number;
}

/**
 * API response wrapper for stock balance data.
 *
 * Constraints:
 * - data: 1-20 items with unique tickers
 * - timestamp: ISO 8601 response generation time
 */
export interface StockBalanceResponse {
  /** Array of stock balances (1-20 items, unique tickers) */
  data: StockBalance[];
  /** ISO 8601 UTC timestamp of response generation */
  timestamp: string;
}
