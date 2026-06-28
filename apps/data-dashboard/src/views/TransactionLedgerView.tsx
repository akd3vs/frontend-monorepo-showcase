import '@frontend-monorepo-showcase/design-tokens/css/layers';
import '@frontend-monorepo-showcase/design-tokens/css';
import '@frontend-monorepo-showcase/design-tokens/css/dark';

import { useState } from 'react';

import { useTransactions } from '../hooks/useTransactions';

const DEFAULT_PAGE_SIZE = 20;

const containerStyle: React.CSSProperties = {
  background: 'var(--color-surface, #ffffff)',
  border: '1px solid var(--color-neutral-200, #e5e7eb)',
  borderRadius: '12px',
  boxShadow: 'var(--elevation-1, 0 1px 3px rgba(0,0,0,0.08))',
  overflow: 'hidden',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSize: '14px',
};

const headerCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-secondary, #6b7280)',
  background: 'var(--color-neutral-50, #f9fafb)',
  borderBottom: '1px solid var(--color-neutral-200, #e5e7eb)',
};

const bodyCellStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: 'var(--color-text-primary, #111827)',
  verticalAlign: 'middle',
};

const statusBadgeBase: React.CSSProperties = {
  display: 'inline-flex',
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1,
};

const statusStyles: Record<string, React.CSSProperties> = {
  completed: {
    ...statusBadgeBase,
    background: 'var(--color-success-50, #f0fdf4)',
    color: 'var(--color-success-700, #166534)',
    border: '1px solid var(--color-success-200, #bbf7d0)',
  },
  pending: {
    ...statusBadgeBase,
    background: 'var(--color-warning-50, #fefce8)',
    color: 'var(--color-warning-700, #854d0e)',
    border: '1px solid var(--color-warning-200, #fef08a)',
  },
  failed: {
    ...statusBadgeBase,
    background: 'var(--color-error-50, #fef2f2)',
    color: 'var(--color-error-700, #991b1b)',
    border: '1px solid var(--color-error-200, #fecaca)',
  },
};

const paginationContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderTop: '1px solid var(--color-neutral-100, #f3f4f6)',
  background: 'var(--color-neutral-50, #fafafa)',
};

const paginationButtonStyle: React.CSSProperties = {
  background: 'var(--color-surface, #ffffff)',
  border: '1px solid var(--color-neutral-300, #d1d5db)',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text-primary, #374151)',
  cursor: 'pointer',
};

const paginationButtonDisabledStyle: React.CSSProperties = {
  ...paginationButtonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const pageTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-secondary, #6b7280)',
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles['pending'];
  return <span style={style}>{status}</span>;
}

function LoadingSkeleton() {
  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div aria-busy="true" aria-label="Loading transactions">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Type</th>
              <th style={headerCellStyle}>Asset</th>
              <th style={headerCellStyle}>Amount</th>
              <th style={headerCellStyle}>Timestamp</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--color-neutral-100, #f3f4f6)' : 'none' }}>
                <td style={bodyCellStyle}>
                  <div style={{ width: '80px', height: '14px', background: 'var(--color-neutral-100, #f3f4f6)', borderRadius: '4px', animation: 'pulse 2s infinite ease-in-out' }} />
                </td>
                <td style={bodyCellStyle}>
                  <div style={{ width: '60px', height: '14px', background: 'var(--color-neutral-100, #f3f4f6)', borderRadius: '4px', animation: 'pulse 2s infinite ease-in-out' }} />
                </td>
                <td style={bodyCellStyle}>
                  <div style={{ width: '90px', height: '14px', background: 'var(--color-neutral-100, #f3f4f6)', borderRadius: '4px', animation: 'pulse 2s infinite ease-in-out' }} />
                </td>
                <td style={bodyCellStyle}>
                  <div style={{ width: '150px', height: '14px', background: 'var(--color-neutral-100, #f3f4f6)', borderRadius: '4px', animation: 'pulse 2s infinite ease-in-out' }} />
                </td>
                <td style={bodyCellStyle}>
                  <div style={{ width: '70px', height: '14px', background: 'var(--color-neutral-100, #f3f4f6)', borderRadius: '4px', animation: 'pulse 2s infinite ease-in-out' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <div style={containerStyle}>
        <div role="alert" aria-live="assertive" data-testid="transaction-ledger-error" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p style={{ color: 'var(--color-error-700, #991b1b)', marginBottom: '12px', fontSize: '14px' }}>
            Failed to load transactions: {error?.message ?? 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              ...paginationButtonStyle,
              background: 'var(--color-primary-600, #2563eb)',
              color: '#ffffff',
              border: '1px solid var(--color-primary-600, #2563eb)',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  if (transactions.length === 0) {
    return (
      <div style={containerStyle}>
        <div aria-live="polite" data-testid="transaction-ledger-empty" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-secondary, #6b7280)' }}>
          <p>No transactions available.</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div aria-live="polite" data-testid="transaction-ledger-view">
      <div style={containerStyle}>
        <table style={tableStyle} aria-label="Transaction ledger">
          <thead>
            <tr>
              <th style={headerCellStyle}>Type</th>
              <th style={headerCellStyle}>Asset</th>
              <th style={headerCellStyle}>Amount</th>
              <th style={headerCellStyle}>Timestamp</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={tx.transactionId}
                style={{
                  borderBottom: index < transactions.length - 1 ? '1px solid var(--color-neutral-100, #f3f4f6)' : 'none',
                }}
              >
                <td style={bodyCellStyle}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--color-text-primary, #374151)' }}>{tx.type}</span>
                </td>
                <td style={bodyCellStyle}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary, #111827)' }}>{tx.asset}</span>
                </td>
                <td style={bodyCellStyle}>
                  <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary, #111827)' }}>
                    ${tx.amount.toFixed(2)}
                  </span>
                </td>
                <td style={{ ...bodyCellStyle, color: 'var(--color-text-secondary, #6b7280)', fontSize: '13px' }}>
                  {formatTimestamp(tx.timestamp)}
                </td>
                <td style={bodyCellStyle}>
                  <StatusBadge status={tx.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <nav aria-label="Transaction ledger pagination" style={paginationContainerStyle}>
          <button
            disabled={isFirstPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            style={isFirstPage ? paginationButtonDisabledStyle : paginationButtonStyle}
          >
            ← Previous
          </button>
          <span style={pageTextStyle} aria-current="page">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={isLastPage}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
            style={isLastPage ? paginationButtonDisabledStyle : paginationButtonStyle}
          >
            Next →
          </button>
        </nav>
      </div>
    </div>
  );
}
