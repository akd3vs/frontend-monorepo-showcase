// Design tokens CSS — import order matters: layers first, then tokens, then dark overrides
import '@frontend-monorepo-showcase/design-tokens/css/layers';
import '@frontend-monorepo-showcase/design-tokens/css';
import '@frontend-monorepo-showcase/design-tokens/css/dark';
import '@frontend-monorepo-showcase/design-tokens/css/high-contrast';

import { Outlet, createRootRoute } from '@tanstack/react-router';

import { AppShell } from '../components/AppShell';
import { ThemeWrapper } from '../components/ThemeWrapper';
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
      <ThemeWrapper>
        <AppShell>
          <Outlet />
        </AppShell>
        <DevtoolsWidget />
      </ThemeWrapper>
    </FeatureFlagProvider>
  );
}
