import { createFileRoute } from '@tanstack/react-router';

import { StockBalancesView } from '../federation/stock-balances';

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <main>
      <h1>Portfolio</h1>
      <StockBalancesView />
    </main>
  );
}
