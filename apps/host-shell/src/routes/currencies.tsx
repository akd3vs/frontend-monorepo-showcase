import { createFileRoute } from '@tanstack/react-router';

import { CurrencyAllocationsView } from '../federation/currency-allocations';

export const Route = createFileRoute('/currencies')({
  component: CurrenciesPage,
});

function CurrenciesPage() {
  return (
    <main>
      <h1>Currencies</h1>
      <CurrencyAllocationsView />
    </main>
  );
}
