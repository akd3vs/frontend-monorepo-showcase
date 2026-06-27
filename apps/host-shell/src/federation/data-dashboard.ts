import { createFederatedComponent } from '../components/FederatedModule';

/**
 * Federated Data Dashboard module.
 * Loaded from the data_dashboard remote with full error boundary protection.
 */
export const DashboardApp = createFederatedComponent(
  () => import('data_dashboard/DashboardApp'),
  {
    boundaryId: 'federated-data-dashboard',
    loadingLabel: 'Loading dashboard…',
  },
);
