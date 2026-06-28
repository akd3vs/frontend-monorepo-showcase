/** Table-level configuration shared across compound sub-components */
export interface TableContextValue {
    /** Visual variant of the table */
    variant?: 'default' | 'striped';
}
/** Context for Table → direct children (Header, Body, Footer) */
export declare const TableContext: import("react").Context<TableContextValue | null>;
/** Context indicating we are inside a Table.Header section */
export declare const TableSectionContext: import("react").Context<"header" | "body" | "footer" | null>;
/** Context indicating we are inside a Table.Row */
export declare const TableRowContext: import("react").Context<boolean>;
/**
 * Hook to access the TableContext. Throws in dev mode if used outside Table.
 */
export declare function useTableContext(): TableContextValue;
/**
 * Hook to access the TableSectionContext.
 */
export declare function useTableSectionContext(): 'header' | 'body' | 'footer' | null;
/**
 * Hook to verify Row context.
 */
export declare function useTableRowContext(): boolean;
//# sourceMappingURL=TableContext.d.ts.map