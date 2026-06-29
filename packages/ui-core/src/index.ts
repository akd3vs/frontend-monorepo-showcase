// UI Core component library - barrel export
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Card, CardLegacy } from './components/Card';
export type { CardProps, CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardActionsProps } from './components/Card';

export { Table, TableLegacy } from './components/Table';
export type { TableProps, TableColumn } from './components/Table';

export { Skeleton } from './components/Skeleton';
export type { SkeletonProps } from './components/Skeleton';

export { ErrorBoundary } from './components/ErrorBoundary';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryTelemetryEvent,
} from './components/ErrorBoundary';

export { theme, colors, spacing, typography } from './theme';
export type { Theme, Colors, Spacing, Typography } from './theme';

export { ThemeProvider } from './providers';
export type { ThemeProviderProps } from './providers';
