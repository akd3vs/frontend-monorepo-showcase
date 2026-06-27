import { createFederatedComponent } from '../components/FederatedModule';

export const TransactionLedgerView = createFederatedComponent(
  () => import('data_dashboard/TransactionLedgerView'),
  {
    boundaryId: 'federated-transaction-ledger',
    loadingLabel: 'Loading transactions…',
  },
);
