import { useQuery } from '@tanstack/react-query';

export interface CurrencyAllocation {
  /** ISO 4217 currency code (3 uppercase letters) */
  currencyCode: string;
  /** Percentage of total portfolio (0.01 - 100.00, up to 2 decimal places) */
  allocationPercentage: number;
  /** Absolute monetary value (>= 0.01, exactly 2 decimal places) */
  absoluteValue: number;
}

export interface CurrencyAllocationResponse {
  /** Array of currency allocations (percentages sum to 100.00) */
  data: CurrencyAllocation[];
  /** ISO 8601 UTC timestamp of response generation */
  timestamp: string;
}

async function fetchCurrencyAllocations(): Promise<CurrencyAllocationResponse> {
  const response = await fetch('/api/currencies');

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export function useCurrencyAllocations() {
  return useQuery<CurrencyAllocationResponse>({
    queryKey: ['currencies'],
    queryFn: fetchCurrencyAllocations,
  });
}
