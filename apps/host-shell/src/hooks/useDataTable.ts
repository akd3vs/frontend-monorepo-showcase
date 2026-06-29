import { keepPreviousData, useQuery } from '@tanstack/react-query';

/**
 * Options for the useDataTable hook.
 *
 * @template T - The type of each row in the table data array.
 */
export interface UseDataTableOptions<T> {
  /** TanStack Query cache key for the data set. */
  queryKey: unknown[];
  /** Async function that fetches the table data rows. */
  queryFn: () => Promise<T[]>;
  /**
   * When provided, enables `keepPreviousData` behavior so that stale data
   * remains visible during refetches instead of showing a loading state.
   */
  placeholderData?: T[];
}

/**
 * Result returned by the useDataTable hook.
 *
 * @template T - The type of each row in the table data array.
 */
export interface UseDataTableResult<T> {
  /**
   * True only when the query has succeeded and data is defined.
   * Use this guard to decide when to swap Skeleton for Table content.
   */
  isDataReady: boolean;
  /** The resolved data rows (empty array as default when not yet loaded). */
  data: T[];
  /** True when data has loaded successfully but contains zero rows. */
  isEmpty: boolean;
  /** True when displaying stale/placeholder data while a fresh fetch is in-flight. */
  isStale: boolean;
}

/**
 * A hook that wraps TanStack Query's `useQuery` to coordinate data loading
 * states for table components.
 *
 * It provides an `isDataReady` guard derived from query status, ensuring that
 * Skeleton → Table transitions happen atomically in a single render frame.
 *
 * @template T - The type of each row in the table data array.
 *
 * @example
 * ```tsx
 * const { isDataReady, data, isEmpty } = useDataTable({
 *   queryKey: ['metrics'],
 *   queryFn: fetchMetrics,
 * });
 *
 * if (!isDataReady) return <Skeleton variant="rectangular" height={400} />;
 * if (isEmpty) return <EmptyState message="No metrics available" />;
 * return <Table columns={columns} data={data} ariaLabel="Metrics" />;
 * ```
 */
export function useDataTable<T>({
  queryKey,
  queryFn,
  placeholderData,
}: UseDataTableOptions<T>): UseDataTableResult<T> {
  const query = useQuery({
    queryKey,
    queryFn,
    placeholderData: placeholderData ? keepPreviousData : undefined,
  });

  const isDataReady = query.status === 'success' && query.data !== undefined;
  const isEmpty = isDataReady && query.data.length === 0;
  const isStale = query.isPlaceholderData;

  return { isDataReady, data: query.data ?? [], isEmpty, isStale };
}
