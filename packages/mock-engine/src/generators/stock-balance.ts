import type { StockBalance, StockBalanceResponse } from '../contracts/index.js';

const TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM',
  'V', 'JNJ', 'WMT', 'PG', 'MA', 'HD', 'DIS', 'BAC', 'XOM', 'PFE',
  'KO', 'PEP',
];

/**
 * Generates a random price between 0.01 and 999999.99 with exactly 2 decimal places.
 */
function randomPrice(): number {
  const raw = Math.random() * 999999.98 + 0.01;
  return Math.round(raw * 100) / 100;
}

/**
 * Generates a random integer >= 1.
 */
function randomQuantity(): number {
  return Math.floor(Math.random() * 1000) + 1;
}

/**
 * Generates stock balance data with 1-20 unique tickers.
 */
export function generateStockBalances(count?: number): StockBalance[] {
  const numItems = count ?? Math.floor(Math.random() * 20) + 1;
  const shuffled = [...TICKERS].sort(() => Math.random() - 0.5);
  const selectedTickers = shuffled.slice(0, Math.min(numItems, TICKERS.length));

  return selectedTickers.map((ticker) => {
    const quantity = randomQuantity();
    const currentPrice = randomPrice();
    const totalValue = Math.round(quantity * currentPrice * 100) / 100;
    return { ticker, quantity, currentPrice, totalValue };
  });
}

/**
 * Generates a full StockBalanceResponse with timestamp.
 */
export function generateStockBalanceResponse(): StockBalanceResponse {
  return {
    data: generateStockBalances(),
    timestamp: new Date().toISOString(),
  };
}
