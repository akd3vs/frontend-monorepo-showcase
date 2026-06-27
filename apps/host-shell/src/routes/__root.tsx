import { Outlet, createRootRoute } from '@tanstack/react-router';

import { AppShell } from '../components/AppShell';
import { FeatureFlagProvider, FeatureFlagBridge } from '../features/feature-flags';
import { DevtoolsWidget } from '../federation';
import '../styles/shell.css';
import '../styles/transitions.css';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <FeatureFlagProvider>
      <FeatureFlagBridge />
      <AppShell>
        <Outlet />
      </AppShell>
      <DevtoolsWidget />
    </FeatureFlagProvider>
  );
}
