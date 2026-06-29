import { createContext, useContext } from 'react';

/** Card-level configuration shared across compound sub-components */
export interface CardContextValue {
  /** Whether the card has a header */
  hasHeader: boolean;
  /** Whether the card has a footer */
  hasFooter: boolean;
}

/** Context for Card → direct children (Header, Body, Footer, Actions) */
export const CardContext = createContext<CardContextValue | null>(null);

/**
 * Hook to access the CardContext. Throws in dev mode if used outside Card.
 */
export function useCardContext(): CardContextValue {
  const ctx = useContext(CardContext);
  if (ctx === null) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        '[Card] Sub-component used outside of <Card>. Ensure Card.Header, Card.Body, Card.Footer, or Card.Actions is rendered inside <Card>.'
      );
    }
    // In production, return a default value to avoid crashes
    return { hasHeader: false, hasFooter: false };
  }
  return ctx;
}
