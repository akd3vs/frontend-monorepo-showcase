export interface TransactionEntry {
    /** Unique transaction identifier */
    transactionId: string;
    /** ISO 8601 UTC timestamp */
    timestamp: string;
    /** Transaction type */
    type: 'buy' | 'sell' | 'transfer';
    /** Asset ticker (1-5 uppercase letters) */
    asset: string;
    /** Amount (>= 0.01, exactly 2 decimal places) */
    amount: number;
    /** Transaction status */
    status: 'pending' | 'completed' | 'failed';
}
export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
export interface TransactionLedgerResponse {
    data: TransactionEntry[];
    pagination: PaginationMeta;
    timestamp: string;
}
export declare function useTransactions(page: number, pageSize?: number): import("@tanstack/react-query").UseQueryResult<NoInfer<TransactionLedgerResponse>, Error>;
//# sourceMappingURL=useTransactions.d.ts.map