export interface StockBalance {
    /** Stock ticker symbol (1-5 uppercase letters) */
    ticker: string;
    /** Number of shares held (integer >= 1) */
    quantity: number;
    /** Current price per share (0.01 - 999,999.99, 2 decimal places) */
    currentPrice: number;
    /** Total position value: quantity × currentPrice (2 decimal places) */
    totalValue: number;
}
export interface StockBalanceResponse {
    /** Array of stock balances (1-20 items, unique tickers) */
    data: StockBalance[];
    /** ISO 8601 UTC timestamp of response generation */
    timestamp: string;
}
export declare function useStockBalances(): import("@tanstack/react-query").UseQueryResult<NoInfer<StockBalanceResponse>, Error>;
//# sourceMappingURL=useStockBalances.d.ts.map