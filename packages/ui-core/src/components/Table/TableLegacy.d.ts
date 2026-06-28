import React from 'react';
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
export declare function TableLegacy<T extends Record<string, unknown>>({ columns, data, ariaLabel, className, }: TableProps<T>): React.ReactElement;
//# sourceMappingURL=TableLegacy.d.ts.map