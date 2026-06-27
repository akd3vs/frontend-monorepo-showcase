import { useQuery } from '@tanstack/react-query';

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

export interface StockBalanceResponse {
  /** Array of stock balances (1-20 items, unique tickers) */
  data: StockBalance[];
  /** ISO 8601 UTC timestamp of response generation */
  timestamp: string;
}

async function fetchStockBalances(): Promise<StockBalanceResponse> {
  const response = await fetch('/api/stocks');

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export function useStockBalances() {
  return useQuery<StockBalanceResponse>({
    queryKey: ['stocks'],
    queryFn: fetchStockBalances,
  });
}
