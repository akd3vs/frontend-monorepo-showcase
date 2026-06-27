// UI Core component library - barrel export
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { Table } from './components/Table';
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
