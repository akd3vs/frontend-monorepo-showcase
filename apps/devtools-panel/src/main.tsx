import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DevtoolsWidget from './DevtoolsWidget';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <DevtoolsWidget />
    </StrictMode>,
  );
}
