import type {
  CurrencyAllocation,
  CurrencyAllocationResponse,
} from '../contracts/index.js';

const CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'SEK', 'NOK',
];

/**
 * Generates currency allocation data where percentages sum to exactly 100.00.
 *
 * Strategy: generate random weights, normalize to sum to 10000 (hundredths),
 * then distribute remainders to ensure exact sum.
 */
export function generateCurrencyAllocations(count?: number): CurrencyAllocation[] {
  const numItems = count ?? Math.floor(Math.random() * 8) + 2; // 2-9 items
  const codes = [...CURRENCY_CODES]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(numItems, CURRENCY_CODES.length));

  // Generate random percentages that sum to exactly 100.00
  const rawWeights = codes.map(() => Math.random() + 0.01);
  const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0);

  // Scale to sum to 10000 (representing 100.00 with 2 decimal precision)
  const scaledValues = rawWeights.map((w) => Math.floor((w / totalWeight) * 10000));

  // Distribute remainder to reach exactly 10000
  let remainder = 10000 - scaledValues.reduce((sum, v) => sum + v, 0);
  for (let i = 0; remainder > 0; i = (i + 1) % scaledValues.length) {
    scaledValues[i] = scaledValues[i]! + 1;
    remainder--;
  }

  // Ensure minimum is 1 (0.01%)
  for (let i = 0; i < scaledValues.length; i++) {
    if (scaledValues[i]! < 1) {
      // Steal from the largest
      const maxIdx = scaledValues.indexOf(Math.max(...scaledValues));
      scaledValues[maxIdx] = scaledValues[maxIdx]! - 1;
      scaledValues[i] = 1;
    }
  }

  return codes.map((currencyCode, i) => {
    const allocationPercentage = scaledValues[i]! / 100;
    const absoluteValue = Math.max(0.01, Math.round((allocationPercentage / 100) * 1000000) / 100);
    return {
      currencyCode,
      allocationPercentage,
      absoluteValue,
    };
  });
}

/**
 * Generates a full CurrencyAllocationResponse with timestamp.
 */
export function generateCurrencyAllocationResponse(): CurrencyAllocationResponse {
  return {
    data: generateCurrencyAllocations(),
    timestamp: new Date().toISOString(),
  };
}
