import React from 'react';

import styles from './Table.module.css';
import {
  TableContext,
  TableRowContext,
  TableSectionContext,
  useTableContext,
  useTableRowContext,
  useTableSectionContext,
} from './TableContext';

// ─── Branded Types for Compile-Time Nesting Enforcement ─────────────────────

declare const TABLE_HEADER_BRAND: unique symbol;
declare const TABLE_BODY_BRAND: unique symbol;
declare const TABLE_FOOTER_BRAND: unique symbol;
declare const TABLE_ROW_BRAND: unique symbol;
declare const TABLE_CELL_BRAND: unique symbol;

/** Branded element representing a Table.Header */
export type TableHeaderElement = React.ReactElement & { readonly [TABLE_HEADER_BRAND]?: true };
/** Branded element representing a Table.Body */
export type TableBodyElement = React.ReactElement & { readonly [TABLE_BODY_BRAND]?: true };
/** Branded element representing a Table.Footer */
export type TableFooterElement = React.ReactElement & { readonly [TABLE_FOOTER_BRAND]?: true };
/** Branded element representing a Table.Row */
export type TableRowElement = React.ReactElement & { readonly [TABLE_ROW_BRAND]?: true };
/** Branded element representing a Table.Cell */
export type TableCellElement = React.ReactElement & { readonly [TABLE_CELL_BRAND]?: true };

// ─── Props Interfaces ────────────────────────────────────────────────────────

/** Props for the root Table compound component. */
export interface TableRootProps {
  /** Children must be Table.Header, Table.Body, and/or Table.Footer sub-components. */
  children: React.ReactNode;
  /** Accessible label describing the table content for screen readers. */
  ariaLabel: string;
  /** Visual variant of the table. 'striped' adds alternating row backgrounds. Defaults to 'default'. */
  variant?: 'default' | 'striped';
  /** Additional CSS class name to apply to the table element. */
  className?: string;
}

/** Props for the Table.Header sub-component. */
export interface TableHeaderProps {
  /** Children must be Table.Row elements containing header cells. */
  children: TableRowElement | TableRowElement[];
}

/** Props for the Table.Body sub-component. */
export interface TableBodyProps {
  /** Children must be Table.Row elements containing data cells. */
  children: TableRowElement | TableRowElement[];
}

/** Props for the Table.Footer sub-component. */
export interface TableFooterProps {
  /** Children must be Table.Row elements for the table footer. */
  children: TableRowElement | TableRowElement[];
}

/** Props for the Table.Row sub-component. */
export interface TableRowProps {
  /** Children must be Table.Cell elements. */
  children: TableCellElement | TableCellElement[];
  /** Additional CSS class name to apply to the row element. */
  className?: string;
}

/** Props for the Table.Cell sub-component. */
export interface TableCellProps {
  /** Content of the cell. Can be any React node. */
  children: React.ReactNode;
  /** Whether this cell is a header cell (renders as th instead of td). Auto-detected in Table.Header. */
  header?: boolean;
  /** The scope attribute for header cells. Indicates whether the header relates to a column, row, or group. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  /** Additional CSS class name to apply to the cell element. */
  className?: string;
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

const VALID_TABLE_CHILDREN = new Set<React.FC<unknown> | React.ComponentType<unknown>>();
const VALID_SECTION_CHILDREN = new Set<React.FC<unknown> | React.ComponentType<unknown>>();
const VALID_ROW_CHILDREN = new Set<React.FC<unknown> | React.ComponentType<unknown>>();

function isValidTableChild(child: React.ReactElement): boolean {
  return VALID_TABLE_CHILDREN.has(child.type as React.FC<unknown>);
}

function isValidSectionChild(child: React.ReactElement): boolean {
  return VALID_SECTION_CHILDREN.has(child.type as React.FC<unknown>);
}

function isValidRowChild(child: React.ReactElement): boolean {
  return VALID_ROW_CHILDREN.has(child.type as React.FC<unknown>);
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function TableHeader({ children }: TableHeaderProps): React.ReactElement {
  useTableContext(); // Validates we're inside Table

  if (process.env.NODE_ENV !== 'production') {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidSectionChild(child)) {
        console.warn(
          '[Table.Header] Invalid child component rendered. Expected Table.Row.'
        );
      }
    });
  }

  return (
    <TableSectionContext.Provider value="header">
      <thead>{children}</thead>
    </TableSectionContext.Provider>
  );
}

function TableBody({ children }: TableBodyProps): React.ReactElement {
  useTableContext(); // Validates we're inside Table

  if (process.env.NODE_ENV !== 'production') {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidSectionChild(child)) {
        console.warn(
          '[Table.Body] Invalid child component rendered. Expected Table.Row.'
        );
      }
    });
  }

  return (
    <TableSectionContext.Provider value="body">
      <tbody>{children}</tbody>
    </TableSectionContext.Provider>
  );
}

function TableFooter({ children }: TableFooterProps): React.ReactElement {
  useTableContext(); // Validates we're inside Table

  if (process.env.NODE_ENV !== 'production') {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidSectionChild(child)) {
        console.warn(
          '[Table.Footer] Invalid child component rendered. Expected Table.Row.'
        );
      }
    });
  }

  return (
    <TableSectionContext.Provider value="footer">
      <tfoot>{children}</tfoot>
    </TableSectionContext.Provider>
  );
}

function TableRow({ children, className }: TableRowProps): React.ReactElement {
  useTableContext(); // Validates we're inside Table
  const section = useTableSectionContext();

  if (process.env.NODE_ENV !== 'production') {
    if (section === null) {
      console.warn(
        '[Table.Row] Rendered outside of Table.Header, Table.Body, or Table.Footer.'
      );
    }
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidRowChild(child)) {
        console.warn(
          '[Table.Row] Invalid child component rendered. Expected Table.Cell.'
        );
      }
    });
  }

  const rowClassName = [
    section === 'body' ? styles['bodyRow'] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TableRowContext.Provider value={true}>
      <tr className={rowClassName || undefined}>{children}</tr>
    </TableRowContext.Provider>
  );
}

function TableCell({
  children,
  header,
  scope,
  className,
}: TableCellProps): React.ReactElement {
  useTableContext(); // Validates we're inside Table
  const section = useTableSectionContext();
  const inRow = useTableRowContext();

  if (process.env.NODE_ENV !== 'production') {
    if (!inRow) {
      console.warn(
        '[Table.Cell] Rendered outside of Table.Row.'
      );
    }
  }

  // Auto-detect header if in header section and not explicitly set
  const isHeader = header ?? section === 'header';

  if (isHeader) {
    const cellClassName = [styles['headerCell'], className].filter(Boolean).join(' ');
    return (
      <th scope={scope ?? 'col'} className={cellClassName || undefined}>
        {children}
      </th>
    );
  }

  const cellClassName = [styles['bodyCell'], className].filter(Boolean).join(' ');
  return <td className={cellClassName || undefined}>{children}</td>;
}

// ─── Root Component ──────────────────────────────────────────────────────────

function TableRoot({
  children,
  ariaLabel,
  variant = 'default',
  className,
}: TableRootProps): React.ReactElement {
  if (process.env.NODE_ENV !== 'production') {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidTableChild(child)) {
        console.warn(
          '[Table] Invalid child component rendered. Expected Table.Header, Table.Body, or Table.Footer.'
        );
      }
    });
  }

  const tableClassName = [styles['table'], className].filter(Boolean).join(' ');

  return (
    <TableContext.Provider value={{ variant }}>
      <div
        className={styles['wrapper']}
        role="region"
        aria-label={`${ariaLabel} (scrollable)`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- tabIndex needed on scrollable region for keyboard accessibility
        tabIndex={0}
      >
        <table role="table" aria-label={ariaLabel} className={tableClassName}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

// ─── Register Valid Children for Validation ──────────────────────────────────

VALID_TABLE_CHILDREN.add(TableHeader as unknown as React.FC<unknown>);
VALID_TABLE_CHILDREN.add(TableBody as unknown as React.FC<unknown>);
VALID_TABLE_CHILDREN.add(TableFooter as unknown as React.FC<unknown>);

VALID_SECTION_CHILDREN.add(TableRow as unknown as React.FC<unknown>);

VALID_ROW_CHILDREN.add(TableCell as unknown as React.FC<unknown>);

// ─── Compound Export ─────────────────────────────────────────────────────────

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Footer: TableFooter,
});
