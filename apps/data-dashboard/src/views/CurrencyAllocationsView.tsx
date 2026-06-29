import '@frontend-monorepo-showcase/design-tokens/css/layers';
import '@frontend-monorepo-showcase/design-tokens/css';
import '@frontend-monorepo-showcase/design-tokens/css/dark';

import { useCurrencyAllocations } from '../hooks/useCurrencyAllocations';

import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  background: 'var(--color-surface, #ffffff)',
  border: '1px solid var(--color-neutral-200, #e5e7eb)',
  borderRadius: '12px',
  boxShadow: 'var(--elevation-1, 0 1px 3px rgba(0,0,0,0.08))',
  overflow: 'hidden',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSize: '14px',
};

const headerCellStyle: CSSProperties = {
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

const bodyCellStyle: CSSProperties = {
  padding: '14px 16px',
  color: 'var(--color-text-primary, #111827)',
  verticalAlign: 'middle',
};

const retryButtonStyle: CSSProperties = {
  background: 'var(--color-primary-600, #2563eb)',
  border: '1px solid var(--color-primary-600, #2563eb)',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  cursor: 'pointer',
};

function LoadingSkeleton() {
  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div aria-busy="true" aria-label="Loading currency allocations">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Currency</th>
              <th style={headerCellStyle}>Allocation</th>
              <th style={headerCellStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < 4 ? '1px solid var(--color-neutral-100, #f3f4f6)' : 'none',
                }}
              >
                <td style={bodyCellStyle}>
                  <div
                    style={{
                      width: '60px',
                      height: '14px',
                      background: 'var(--color-neutral-100, #f3f4f6)',
                      borderRadius: '4px',
                      animation: 'pulse 2s infinite ease-in-out',
                    }}
                  />
                </td>
                <td style={bodyCellStyle}>
                  <div
                    style={{
                      width: '90px',
                      height: '14px',
                      background: 'var(--color-neutral-100, #f3f4f6)',
                      borderRadius: '4px',
                      animation: 'pulse 2s infinite ease-in-out',
                    }}
                  />
                </td>
                <td style={bodyCellStyle}>
                  <div
                    style={{
                      width: '100px',
                      height: '14px',
                      background: 'var(--color-neutral-100, #f3f4f6)',
                      borderRadius: '4px',
                      animation: 'pulse 2s infinite ease-in-out',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CurrencyAllocationsView() {
  const { data, isLoading, isError, error, refetch } = useCurrencyAllocations();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div style={containerStyle}>
        <div
          role="alert"
          aria-live="assertive"
          data-testid="currency-allocations-error"
          style={{ textAlign: 'center', padding: '32px 16px' }}
        >
          <p
            style={{
              color: 'var(--color-error-700, #991b1b)',
              marginBottom: '12px',
              fontSize: '14px',
            }}
          >
            Failed to load currency allocations: {error?.message ?? 'Unknown error'}
          </p>
          <button onClick={() => refetch()} style={retryButtonStyle}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allocations = data?.data ?? [];

  if (allocations.length === 0) {
    return (
      <div style={containerStyle}>
        <div
          aria-live="polite"
          data-testid="currency-allocations-empty"
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: 'var(--color-text-secondary, #6b7280)',
          }}
        >
          <p>No currency allocations available.</p>
        </div>
      </div>
    );
  }

  return (
    <div aria-live="polite" data-testid="currency-allocations-view">
      <div style={containerStyle}>
        <table style={tableStyle} aria-label="Currency allocations">
          <thead>
            <tr>
              <th style={headerCellStyle}>Currency</th>
              <th style={headerCellStyle}>Allocation</th>
              <th style={headerCellStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation, index) => (
              <tr
                key={allocation.currencyCode}
                style={{
                  borderBottom:
                    index < allocations.length - 1
                      ? '1px solid var(--color-neutral-100, #f3f4f6)'
                      : 'none',
                }}
              >
                <td style={bodyCellStyle}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      color: 'var(--color-text-primary, #111827)',
                    }}
                  >
                    {allocation.currencyCode}
                  </span>
                </td>
                <td style={bodyCellStyle}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--color-text-primary, #111827)',
                    }}
                  >
                    {allocation.allocationPercentage.toFixed(1)}%
                  </span>
                  <div
                    style={{
                      marginTop: '4px',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'var(--color-neutral-100, #f3f4f6)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(allocation.allocationPercentage, 100)}%`,
                        background: 'var(--color-primary-500, #3b82f6)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </td>
                <td style={bodyCellStyle}>
                  <span
                    style={{
                      fontWeight: 500,
                      fontFamily: 'monospace',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--color-text-primary, #111827)',
                    }}
                  >
                    ${allocation.absoluteValue.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
