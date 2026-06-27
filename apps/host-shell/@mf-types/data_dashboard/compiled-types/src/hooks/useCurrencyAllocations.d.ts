export interface CurrencyAllocation {
    /** ISO 4217 currency code (3 uppercase letters) */
    currencyCode: string;
    /** Percentage of total portfolio (0.01 - 100.00, up to 2 decimal places) */
    allocationPercentage: number;
    /** Absolute monetary value (>= 0.01, exactly 2 decimal places) */
    absoluteValue: number;
}
export interface CurrencyAllocationResponse {
    /** Array of currency allocations (percentages sum to 100.00) */
    data: CurrencyAllocation[];
    /** ISO 8601 UTC timestamp of response generation */
    timestamp: string;
}
export declare function useCurrencyAllocations(): import("@tanstack/react-query").UseQueryResult<NoInfer<CurrencyAllocationResponse>, Error>;
//# sourceMappingURL=useCurrencyAllocations.d.ts.map