import { useState } from 'react';

import { useTransactions } from '../hooks/useTransactions';

const DEFAULT_PAGE_SIZE = 20;

function SkeletonRow() {
  return (
    <tr>
      <td>
        <span className="skeleton skeleton-text" aria-hidden="true" />
      </td>
      <td>
        <span className="skeleton skeleton-text" aria-hidden="true" />
      </td>
      <td>
        <span className="skeleton skeleton-text" aria-hidden="true" />
      </td>
      <td>
        <span className="skeleton skeleton-text" aria-hidden="true" />
      </td>
      <td>
        <span className="skeleton skeleton-text" aria-hidden="true" />
      </td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading transactions">
      <table role="table" aria-label="Transaction ledger loading">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Asset</th>
            <th scope="col">Amount</th>
            <th scope="col">Timestamp</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function TransactionLedgerView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTransactions(
    page,
    DEFAULT_PAGE_SIZE,
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div role="alert" aria-live="assertive" data-testid="transaction-ledger-error">
        <p>Failed to load transactions: {error?.message ?? 'Unknown error'}</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  if (transactions.length === 0) {
    return (
      <div aria-live="polite" data-testid="transaction-ledger-empty">
        <p>No transactions available.</p>
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div aria-live="polite" data-testid="transaction-ledger-view">
      <table role="table" aria-label="Transaction ledger">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Asset</th>
            <th scope="col">Amount</th>
            <th scope="col">Timestamp</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transactionId}>
              <td>{tx.type}</td>
              <td>{tx.asset}</td>
              <td>${tx.amount.toFixed(2)}</td>
              <td>{formatTimestamp(tx.timestamp)}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav aria-label="Transaction ledger pagination">
        <button
          type="button"
          aria-label="Previous page"
          disabled={isFirstPage}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span aria-current="page">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={isLastPage}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
