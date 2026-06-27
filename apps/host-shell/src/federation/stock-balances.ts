import { createFederatedComponent } from '../components/FederatedModule';

export const StockBalancesView = createFederatedComponent(
  () => import('data_dashboard/StockBalancesView'),
  {
    boundaryId: 'federated-stock-balances',
    loadingLabel: 'Loading stock balances…',
  },
);
