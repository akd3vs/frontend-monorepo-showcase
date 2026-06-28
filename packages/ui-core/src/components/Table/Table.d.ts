import React from 'react';
declare const TABLE_HEADER_BRAND: unique symbol;
declare const TABLE_BODY_BRAND: unique symbol;
declare const TABLE_FOOTER_BRAND: unique symbol;
declare const TABLE_ROW_BRAND: unique symbol;
declare const TABLE_CELL_BRAND: unique symbol;
/** Branded element representing a Table.Header */
export type TableHeaderElement = React.ReactElement & {
    readonly [TABLE_HEADER_BRAND]?: true;
};
/** Branded element representing a Table.Body */
export type TableBodyElement = React.ReactElement & {
    readonly [TABLE_BODY_BRAND]?: true;
};
/** Branded element representing a Table.Footer */
export type TableFooterElement = React.ReactElement & {
    readonly [TABLE_FOOTER_BRAND]?: true;
};
/** Branded element representing a Table.Row */
export type TableRowElement = React.ReactElement & {
    readonly [TABLE_ROW_BRAND]?: true;
};
/** Branded element representing a Table.Cell */
export type TableCellElement = React.ReactElement & {
    readonly [TABLE_CELL_BRAND]?: true;
};
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
declare function TableHeader({ children }: TableHeaderProps): React.ReactElement;
declare function TableBody({ children }: TableBodyProps): React.ReactElement;
declare function TableFooter({ children }: TableFooterProps): React.ReactElement;
declare function TableRow({ children, className }: TableRowProps): React.ReactElement;
declare function TableCell({ children, header, scope, className, }: TableCellProps): React.ReactElement;
declare function TableRoot({ children, ariaLabel, variant, className, }: TableRootProps): React.ReactElement;
export declare const Table: typeof TableRoot & {
    Header: typeof TableHeader;
    Body: typeof TableBody;
    Row: typeof TableRow;
    Cell: typeof TableCell;
    Footer: typeof TableFooter;
};
export {};
//# sourceMappingURL=Table.d.ts.map