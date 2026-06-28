import React from 'react';

import { Table } from './Table';

/** Definition of a single column in the legacy Table API. */
export interface TableColumn<T = unknown> {
  /** Unique key identifying this column, used to access row data. */
  key: string;
  /** Display text for the column header. */
  header: string;
  /** Optional custom render function for cell content. Receives the cell value and full row data. */
  render?: (value: unknown, row: T) => React.ReactNode;
}

/** Props for the legacy prop-based Table component. */
export interface TableProps<T = Record<string, unknown>> {
  /** Array of column definitions specifying the table structure. */
  columns: TableColumn<T>[];
  /** Array of data rows to display in the table body. */
  data: T[];
  /** Accessible label describing the table content for screen readers. */
  ariaLabel: string;
  /** Additional CSS class name to apply to the table element. */
  className?: string;
}

/**
 * Legacy prop-based Table API preserved for backward compatibility.
 * Internally uses the compound component API.
 */
export function TableLegacy<T extends Record<string, unknown>>({
  columns,
  data,
  ariaLabel,
  className,
}: TableProps<T>): React.ReactElement {
  return (
    <Table ariaLabel={ariaLabel} className={className}>
      <Table.Header>
        <Table.Row>
          {columns.map((col) => (
            <Table.Cell key={col.key} header>
              {col.header}
            </Table.Cell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((row, rowIndex) => (
          <Table.Row key={`row-${rowIndex}`}>
            {columns.map((col) => {
              const value = row[col.key];
              const content = col.render
                ? col.render(value, row)
                : String(value ?? '');
              return (
                <Table.Cell key={`${col.key}-${rowIndex}`}>
                  {content}
                </Table.Cell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
