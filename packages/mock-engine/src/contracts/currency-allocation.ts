/**
 * Represents a currency allocation within a portfolio.
 *
 * Constraints:
 * - currencyCode: ISO 4217 format, regex: /^[A-Z]{3}$/
 * - allocationPercentage: 0.01 - 100.00, up to 2 decimal places
 * - absoluteValue: >= 0.01, exactly 2 decimal places
 *
 * Invariant: sum of allocationPercentage across all items in a response === 100.00
 */
export interface CurrencyAllocation {
  /** ISO 4217 currency code (3 uppercase letters) */
  currencyCode: string;
  /** Percentage of total portfolio (0.01 - 100.00, up to 2 decimal places) */
  allocationPercentage: number;
  /** Absolute monetary value (>= 0.01, exactly 2 decimal places) */
  absoluteValue: number;
}

/**
 * API response wrapper for currency allocation data.
 *
 * Invariant: all allocationPercentage values sum to exactly 100.00
 */
export interface CurrencyAllocationResponse {
  /** Array of currency allocations (percentages sum to 100.00) */
  data: CurrencyAllocation[];
  /** ISO 8601 UTC timestamp of response generation */
  timestamp: string;
}
