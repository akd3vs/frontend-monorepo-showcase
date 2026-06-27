import { createFileRoute } from '@tanstack/react-router';

import { TransactionLedgerView } from '../federation/transaction-ledger';

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <main>
      <h1>Transactions</h1>
      <TransactionLedgerView />
    </main>
  );
}
