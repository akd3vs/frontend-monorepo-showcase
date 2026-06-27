import { useStockBalances } from '../hooks/useStockBalances';

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
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading stock balances">
      <table role="table" aria-label="Stock balances loading">
        <thead>
          <tr>
            <th scope="col">Ticker</th>
            <th scope="col">Quantity</th>
            <th scope="col">Current Price</th>
            <th scope="col">Total Value</th>
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

export default function StockBalancesView() {
  const { data, isLoading, isError, error, refetch } = useStockBalances();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div role="alert" aria-live="assertive" data-testid="stock-balances-error">
        <p>Failed to load stock balances: {error?.message ?? 'Unknown error'}</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const stocks = data?.data ?? [];

  if (stocks.length === 0) {
    return (
      <div aria-live="polite" data-testid="stock-balances-empty">
        <p>No stock balances available.</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" data-testid="stock-balances-view">
      <table role="table" aria-label="Stock balances">
        <thead>
          <tr>
            <th scope="col">Ticker</th>
            <th scope="col">Quantity</th>
            <th scope="col">Current Price</th>
            <th scope="col">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.ticker}>
              <td>{stock.ticker}</td>
              <td>{stock.quantity.toFixed(6)}</td>
              <td>${stock.currentPrice.toFixed(2)}</td>
              <td>${stock.totalValue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
