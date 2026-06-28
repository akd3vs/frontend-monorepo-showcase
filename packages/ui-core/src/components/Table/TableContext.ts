import { createContext, useContext } from 'react';

/** Table-level configuration shared across compound sub-components */
export interface TableContextValue {
  /** Visual variant of the table */
  variant?: 'default' | 'striped';
}

/** Context for Table → direct children (Header, Body, Footer) */
export const TableContext = createContext<TableContextValue | null>(null);

/** Context indicating we are inside a Table.Header section */
export const TableSectionContext = createContext<'header' | 'body' | 'footer' | null>(null);

/** Context indicating we are inside a Table.Row */
export const TableRowContext = createContext<boolean>(false);

/**
 * Hook to access the TableContext. Throws in dev mode if used outside Table.
 */
export function useTableContext(): TableContextValue {
  const ctx = useContext(TableContext);
  if (ctx === null) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        '[Table] Sub-component used outside of <Table>. Ensure Table.Header, Table.Body, or Table.Footer is rendered inside <Table>.'
      );
    }
    // In production, return a default value to avoid crashes
    return { variant: 'default' };
  }
  return ctx;
}

/**
 * Hook to access the TableSectionContext.
 */
export function useTableSectionContext(): 'header' | 'body' | 'footer' | null {
  return useContext(TableSectionContext);
}

/**
 * Hook to verify Row context.
 */
export function useTableRowContext(): boolean {
  return useContext(TableRowContext);
}
