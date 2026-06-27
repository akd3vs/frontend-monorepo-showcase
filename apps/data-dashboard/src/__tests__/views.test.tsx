import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';

import CurrencyAllocationsView from '../views/CurrencyAllocationsView';
import StockBalancesView from '../views/StockBalancesView';
import TransactionLedgerView from '../views/TransactionLedgerView';

// ─── Test utilities ─────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ─── Mock data ──────────────────────────────────────────────────────────────

const mockStockBalances = {
  data: [
    { ticker: 'AAPL', quantity: 150, currentPrice: 189.25, totalValue: 28387.5 },
    { ticker: 'GOOGL', quantity: 25, currentPrice: 141.8, totalValue: 3545.0 },
    { ticker: 'TSLA', quantity: 100, currentPrice: 248.42, totalValue: 24842.0 },
  ],
  timestamp: '2024-03-15T14:30:00Z',
};

const mockCurrencyAllocations = {
  data: [
    { currencyCode: 'USD', allocationPercentage: 60.5, absoluteValue: 50000.0 },
    { currencyCode: 'EUR', allocationPercentage: 25.3, absoluteValue: 20900.0 },
    { currencyCode: 'GBP', allocationPercentage: 14.2, absoluteValue: 11730.0 },
  ],
  timestamp: '2024-03-15T14:30:00Z',
};

const mockTransactions = {
  data: [
    {
      transactionId: 'tx-001',
      timestamp: '2024-03-15T14:30:00Z',
      type: 'buy' as const,
      asset: 'AAPL',
      amount: 1892.5,
      status: 'completed' as const,
    },
    {
      transactionId: 'tx-002',
      timestamp: '2024-03-15T13:00:00Z',
      type: 'sell' as const,
      asset: 'TSLA',
      amount: 4968.4,
      status: 'pending' as const,
    },
    {
      transactionId: 'tx-003',
      timestamp: '2024-03-15T12:00:00Z',
      type: 'transfer' as const,
      asset: 'GOOGL',
      amount: 283.6,
      status: 'failed' as const,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 45,
    totalPages: 3,
  },
  timestamp: '2024-03-15T14:30:00Z',
};

// ─── Fetch mock helpers ─────────────────────────────────────────────────────

function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status: number, message: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: { code: status, message, requestId: 'req-1' } }),
  });
}

function mockFetchLoading() {
  return vi.fn().mockReturnValue(new Promise(() => {})); // Never resolves
}

// ─── Stock Balances View ────────────────────────────────────────────────────

describe('StockBalancesView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton while fetching', () => {
    global.fetch = mockFetchLoading();
    renderWithQuery(<StockBalancesView />);

    const loadingContainer = screen.getByLabelText('Loading stock balances');
    expect(loadingContainer).toBeDefined();
    expect(loadingContainer.getAttribute('aria-busy')).toBe('true');
  });

  it('renders stock balances data with correct formatting', async () => {
    global.fetch = mockFetchSuccess(mockStockBalances);
    renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-view')).toBeDefined();
    });

    // Verify ticker display
    expect(screen.getByText('AAPL')).toBeDefined();
    expect(screen.getByText('GOOGL')).toBeDefined();
    expect(screen.getByText('TSLA')).toBeDefined();

    // Verify quantity with 6 decimal places
    expect(screen.getByText('150.000000')).toBeDefined();
    expect(screen.getByText('25.000000')).toBeDefined();

    // Verify price with 2 decimal places + currency symbol
    expect(screen.getByText('$189.25')).toBeDefined();
    expect(screen.getByText('$141.80')).toBeDefined();

    // Verify total value with 2 decimal places + currency symbol
    expect(screen.getByText('$28387.50')).toBeDefined();
    expect(screen.getByText('$3545.00')).toBeDefined();
  });

  it('renders error state with retry button', async () => {
    global.fetch = mockFetchError(500, 'Internal server error');
    renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-error')).toBeDefined();
    });

    expect(screen.getByText(/Failed to load stock balances/)).toBeDefined();
    expect(screen.getByText(/Internal server error/)).toBeDefined();
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });

  it('retry button refetches data', async () => {
    const fetchMock = mockFetchError(500, 'Server error');
    global.fetch = fetchMock;
    renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-error')).toBeDefined();
    });

    // Now mock a successful response
    global.fetch = mockFetchSuccess(mockStockBalances);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-view')).toBeDefined();
    });
  });

  it('renders empty state when no data', async () => {
    global.fetch = mockFetchSuccess({ data: [], timestamp: '2024-03-15T14:30:00Z' });
    renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-empty')).toBeDefined();
    });

    expect(screen.getByText('No stock balances available.')).toBeDefined();
  });

  it('has proper table structure with ARIA labels', async () => {
    global.fetch = mockFetchSuccess(mockStockBalances);
    renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Stock balances' })).toBeDefined();
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]!.textContent).toBe('Ticker');
    expect(headers[1]!.textContent).toBe('Quantity');
    expect(headers[2]!.textContent).toBe('Current Price');
    expect(headers[3]!.textContent).toBe('Total Value');
  });

  it('passes axe-core accessibility checks in success state', async () => {
    global.fetch = mockFetchSuccess(mockStockBalances);
    const { container } = renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-view')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in loading state', async () => {
    global.fetch = mockFetchLoading();
    const { container } = renderWithQuery(<StockBalancesView />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in error state', async () => {
    global.fetch = mockFetchError(500, 'Server error');
    const { container } = renderWithQuery(<StockBalancesView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-balances-error')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Currency Allocations View ──────────────────────────────────────────────

describe('CurrencyAllocationsView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton while fetching', () => {
    global.fetch = mockFetchLoading();
    renderWithQuery(<CurrencyAllocationsView />);

    const loadingContainer = screen.getByLabelText('Loading currency allocations');
    expect(loadingContainer).toBeDefined();
    expect(loadingContainer.getAttribute('aria-busy')).toBe('true');
  });

  it('renders currency allocations with correct formatting', async () => {
    global.fetch = mockFetchSuccess(mockCurrencyAllocations);
    renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-view')).toBeDefined();
    });

    // Verify currency codes
    expect(screen.getByText('USD')).toBeDefined();
    expect(screen.getByText('EUR')).toBeDefined();
    expect(screen.getByText('GBP')).toBeDefined();

    // Verify percentages with 1 decimal place
    expect(screen.getByText('60.5%')).toBeDefined();
    expect(screen.getByText('25.3%')).toBeDefined();
    expect(screen.getByText('14.2%')).toBeDefined();

    // Verify absolute values with 2 decimal places + currency symbol
    expect(screen.getByText('$50000.00')).toBeDefined();
    expect(screen.getByText('$20900.00')).toBeDefined();
    expect(screen.getByText('$11730.00')).toBeDefined();
  });

  it('renders error state with retry button', async () => {
    global.fetch = mockFetchError(401, 'Unauthorized');
    renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-error')).toBeDefined();
    });

    expect(screen.getByText(/Failed to load currency allocations/)).toBeDefined();
    expect(screen.getByText(/Unauthorized/)).toBeDefined();
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });

  it('retry button refetches data', async () => {
    global.fetch = mockFetchError(500, 'Server error');
    renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-error')).toBeDefined();
    });

    global.fetch = mockFetchSuccess(mockCurrencyAllocations);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-view')).toBeDefined();
    });
  });

  it('renders empty state when no allocations', async () => {
    global.fetch = mockFetchSuccess({ data: [], timestamp: '2024-03-15T14:30:00Z' });
    renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-empty')).toBeDefined();
    });

    expect(screen.getByText('No currency allocations available.')).toBeDefined();
  });

  it('has proper table structure with ARIA labels', async () => {
    global.fetch = mockFetchSuccess(mockCurrencyAllocations);
    renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Currency allocations' })).toBeDefined();
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]!.textContent).toBe('Currency');
    expect(headers[1]!.textContent).toBe('Allocation');
    expect(headers[2]!.textContent).toBe('Value');
  });

  it('passes axe-core accessibility checks in success state', async () => {
    global.fetch = mockFetchSuccess(mockCurrencyAllocations);
    const { container } = renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-view')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in loading state', async () => {
    global.fetch = mockFetchLoading();
    const { container } = renderWithQuery(<CurrencyAllocationsView />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in error state', async () => {
    global.fetch = mockFetchError(401, 'Auth error');
    const { container } = renderWithQuery(<CurrencyAllocationsView />);

    await waitFor(() => {
      expect(screen.getByTestId('currency-allocations-error')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Transaction Ledger View ────────────────────────────────────────────────

describe('TransactionLedgerView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton while fetching', () => {
    global.fetch = mockFetchLoading();
    renderWithQuery(<TransactionLedgerView />);

    const loadingContainer = screen.getByLabelText('Loading transactions');
    expect(loadingContainer).toBeDefined();
    expect(loadingContainer.getAttribute('aria-busy')).toBe('true');
  });

  it('renders transaction data with correct formatting', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    // Verify transaction types
    expect(screen.getByText('buy')).toBeDefined();
    expect(screen.getByText('sell')).toBeDefined();
    expect(screen.getByText('transfer')).toBeDefined();

    // Verify assets
    expect(screen.getByText('AAPL')).toBeDefined();
    expect(screen.getByText('TSLA')).toBeDefined();
    expect(screen.getByText('GOOGL')).toBeDefined();

    // Verify amounts with 2 decimal places + currency symbol
    expect(screen.getByText('$1892.50')).toBeDefined();
    expect(screen.getByText('$4968.40')).toBeDefined();
    expect(screen.getByText('$283.60')).toBeDefined();

    // Verify statuses
    expect(screen.getByText('completed')).toBeDefined();
    expect(screen.getByText('pending')).toBeDefined();
    expect(screen.getByText('failed')).toBeDefined();
  });

  it('renders error state with retry button', async () => {
    global.fetch = mockFetchError(500, 'Database timeout');
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-error')).toBeDefined();
    });

    expect(screen.getByText(/Failed to load transactions/)).toBeDefined();
    expect(screen.getByText(/Database timeout/)).toBeDefined();
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });

  it('retry button refetches data', async () => {
    global.fetch = mockFetchError(500, 'Timeout');
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-error')).toBeDefined();
    });

    global.fetch = mockFetchSuccess(mockTransactions);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });
  });

  it('renders empty state when no transactions', async () => {
    global.fetch = mockFetchSuccess({
      data: [],
      pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      timestamp: '2024-03-15T14:30:00Z',
    });
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-empty')).toBeDefined();
    });

    expect(screen.getByText('No transactions available.')).toBeDefined();
  });

  it('has proper table structure with ARIA labels', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Transaction ledger' })).toBeDefined();
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]!.textContent).toBe('Type');
    expect(headers[1]!.textContent).toBe('Asset');
    expect(headers[2]!.textContent).toBe('Amount');
    expect(headers[3]!.textContent).toBe('Timestamp');
    expect(headers[4]!.textContent).toBe('Status');
  });

  it('renders pagination controls', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDefined();
    expect(screen.getByText('Page 1 of 3')).toBeDefined();
  });

  it('disables previous button on first page', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables next button when more pages exist', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton.hasAttribute('disabled')).toBe(false);
  });

  it('navigates to next page when next button is clicked', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    // Mock response for page 2
    const page2Data = {
      ...mockTransactions,
      pagination: { ...mockTransactions.pagination, page: 2 },
    };
    global.fetch = mockFetchSuccess(page2Data);

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeDefined();
    });
  });

  it('disables next button on last page', async () => {
    const lastPageData = {
      ...mockTransactions,
      pagination: { page: 3, pageSize: 20, totalItems: 45, totalPages: 3 },
    };
    global.fetch = mockFetchSuccess(lastPageData);
    renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton.hasAttribute('disabled')).toBe(true);
  });

  it('passes axe-core accessibility checks in success state', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    const { container } = renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-view')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in loading state', async () => {
    global.fetch = mockFetchLoading();
    const { container } = renderWithQuery(<TransactionLedgerView />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks in error state', async () => {
    global.fetch = mockFetchError(500, 'Server error');
    const { container } = renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-ledger-error')).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core accessibility checks on pagination controls', async () => {
    global.fetch = mockFetchSuccess(mockTransactions);
    const { container } = renderWithQuery(<TransactionLedgerView />);

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeDefined();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
