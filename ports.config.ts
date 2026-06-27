/**
 * Centralized port configuration for all dev servers.
 * Change ports here and all apps will pick them up.
 */
export const ports = {
  hostShell: 3000,
  dataDashboard: 3001,
  devtoolsPanel: 3002,
} as const;
