import { useCurrencyAllocations } from '../hooks/useCurrencyAllocations';

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
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading currency allocations">
      <table role="table" aria-label="Currency allocations loading">
        <thead>
          <tr>
            <th scope="col">Currency</th>
            <th scope="col">Allocation</th>
            <th scope="col">Value</th>
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

export default function CurrencyAllocationsView() {
  const { data, isLoading, isError, error, refetch } = useCurrencyAllocations();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div role="alert" aria-live="assertive" data-testid="currency-allocations-error">
        <p>Failed to load currency allocations: {error?.message ?? 'Unknown error'}</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const allocations = data?.data ?? [];

  if (allocations.length === 0) {
    return (
      <div aria-live="polite" data-testid="currency-allocations-empty">
        <p>No currency allocations available.</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" data-testid="currency-allocations-view">
      <table role="table" aria-label="Currency allocations">
        <thead>
          <tr>
            <th scope="col">Currency</th>
            <th scope="col">Allocation</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation) => (
            <tr key={allocation.currencyCode}>
              <td>{allocation.currencyCode}</td>
              <td>{allocation.allocationPercentage.toFixed(1)}%</td>
              <td>${allocation.absoluteValue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
