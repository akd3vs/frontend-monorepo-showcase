/** Card-level configuration shared across compound sub-components */
export interface CardContextValue {
    /** Whether the card has a header */
    hasHeader: boolean;
    /** Whether the card has a footer */
    hasFooter: boolean;
}
/** Context for Card → direct children (Header, Body, Footer, Actions) */
export declare const CardContext: import("react").Context<CardContextValue | null>;
/**
 * Hook to access the CardContext. Throws in dev mode if used outside Card.
 */
export declare function useCardContext(): CardContextValue;
//# sourceMappingURL=CardContext.d.ts.map