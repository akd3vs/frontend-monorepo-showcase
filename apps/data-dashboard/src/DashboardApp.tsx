import CurrencyAllocationsView from './views/CurrencyAllocationsView';
import StockBalancesView from './views/StockBalancesView';
import TransactionLedgerView from './views/TransactionLedgerView';

export default function DashboardApp() {
  return (
    <div data-testid="dashboard-app">
      <h1>Data Dashboard</h1>
      <section aria-labelledby="stocks-heading">
        <h2 id="stocks-heading">Stock Balances</h2>
        <StockBalancesView />
      </section>
      <section aria-labelledby="currency-heading">
        <h2 id="currency-heading">Currency Allocations</h2>
        <CurrencyAllocationsView />
      </section>
      <section aria-labelledby="transactions-heading">
        <h2 id="transactions-heading">Transaction Ledger</h2>
        <TransactionLedgerView />
      </section>
    </div>
  );
}
