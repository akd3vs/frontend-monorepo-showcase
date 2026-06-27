import { createFederatedComponent } from '../components/FederatedModule';

export const CurrencyAllocationsView = createFederatedComponent(
  () => import('data_dashboard/CurrencyAllocationsView'),
  {
    boundaryId: 'federated-currency-allocations',
    loadingLabel: 'Loading currency allocations…',
  },
);
