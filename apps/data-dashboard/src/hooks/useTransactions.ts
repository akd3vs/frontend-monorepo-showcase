import { useQuery } from '@tanstack/react-query';

export interface TransactionEntry {
  /** Unique transaction identifier */
  transactionId: string;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Transaction type */
  type: 'buy' | 'sell' | 'transfer';
  /** Asset ticker (1-5 uppercase letters) */
  asset: string;
  /** Amount (>= 0.01, exactly 2 decimal places) */
  amount: number;
  /** Transaction status */
  status: 'pending' | 'completed' | 'failed';
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TransactionLedgerResponse {
  data: TransactionEntry[];
  pagination: PaginationMeta;
  timestamp: string;
}

async function fetchTransactions(
  page: number,
  pageSize: number,
): Promise<TransactionLedgerResponse> {
  const response = await fetch(
    `/api/transactions?page=${page}&pageSize=${pageSize}`,
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export function useTransactions(page: number, pageSize: number = 20) {
  return useQuery<TransactionLedgerResponse>({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => fetchTransactions(page, pageSize),
  });
}
