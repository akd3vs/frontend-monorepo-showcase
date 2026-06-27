import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initMockServiceWorker } from './msw/setup';
import { queryClient } from './query-client';
import { getRouter } from './router';

/**
 * Bootstrap the application after MSW is registered.
 * MSW must be fully active before React renders so that all initial
 * data fetches (including those triggered by route loaders) are intercepted.
 */
async function bootstrap() {
  await initMockServiceWorker();

  const router = getRouter();
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element not found');

  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

bootstrap();
