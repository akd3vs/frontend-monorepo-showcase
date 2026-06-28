/**
 * Unit tests for useDataTable and useDelayedLoading hooks.
 *
 * Validates: Requirements 10.1, 10.2, 10.5, 10.6, 10.7
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDataTable } from '../hooks/useDataTable';
import { useDelayedLoading } from '../hooks/useDelayedLoading';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { Wrapper, queryClient };
}

// ─── useDataTable Tests ─────────────────────────────────────────────────────────

describe('useDataTable', () => {
  describe('isDataReady', () => {
    it('is false while the query is loading/pending', async () => {
      const { Wrapper } = createQueryClientWrapper();

      // Never-resolving query to keep status at 'pending'
      const queryFn = () => new Promise<string[]>(() => {});

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-pending'], queryFn }),
        { wrapper: Wrapper },
      );

      // Initially the query is pending, isDataReady should be false
      expect(result.current.isDataReady).toBe(false);
    });

    it('is true only when status === "success" and data !== undefined', async () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => Promise.resolve([{ id: 1, name: 'Alice' }]);

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-success'], queryFn }),
        { wrapper: Wrapper },
      );

      // Wait for query to resolve
      await waitFor(() => {
        expect(result.current.isDataReady).toBe(true);
      });

      expect(result.current.data).toEqual([{ id: 1, name: 'Alice' }]);
    });

    it('is false when the query errors', async () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => Promise.reject(new Error('Fetch failed'));

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-error'], queryFn }),
        { wrapper: Wrapper },
      );

      await waitFor(() => {
        // After error, isDataReady should remain false
        expect(result.current.isDataReady).toBe(false);
      });
    });
  });

  describe('isEmpty', () => {
    it('is true when query succeeds with zero rows', async () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => Promise.resolve([]);

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-empty'], queryFn }),
        { wrapper: Wrapper },
      );

      await waitFor(() => {
        expect(result.current.isDataReady).toBe(true);
      });

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it('is false when query succeeds with data rows', async () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => Promise.resolve([{ id: 1 }, { id: 2 }]);

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-non-empty'], queryFn }),
        { wrapper: Wrapper },
      );

      await waitFor(() => {
        expect(result.current.isDataReady).toBe(true);
      });

      expect(result.current.isEmpty).toBe(false);
    });

    it('is false while loading (before isDataReady is true)', () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => new Promise<never[]>(() => {});

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-empty-loading'], queryFn }),
        { wrapper: Wrapper },
      );

      expect(result.current.isEmpty).toBe(false);
    });
  });

  describe('stale data with keepPreviousData', () => {
    it('displays stale data during refetch when placeholderData is provided', async () => {
      const { Wrapper, queryClient } = createQueryClientWrapper();

      const initialData = [{ id: 1, name: 'Old' }];

      // Pre-seed the cache with initial data
      queryClient.setQueryData(['test-stale'], initialData);

      let resolveRefetch: (value: { id: number; name: string }[]) => void;
      const refetchPromise = new Promise<{ id: number; name: string }[]>((resolve) => {
        resolveRefetch = resolve;
      });

      let callCount = 0;
      const queryFn = () => {
        callCount++;
        if (callCount === 1) {
          return refetchPromise;
        }
        return refetchPromise;
      };

      const { result } = renderHook(
        () =>
          useDataTable({
            queryKey: ['test-stale'],
            queryFn,
            placeholderData: initialData,
          }),
        { wrapper: Wrapper },
      );

      // Should immediately show seeded data as ready
      await waitFor(() => {
        expect(result.current.isDataReady).toBe(true);
      });
      expect(result.current.data).toEqual(initialData);

      // Invalidate to trigger refetch
      act(() => {
        queryClient.invalidateQueries({ queryKey: ['test-stale'] });
      });

      // During refetch, stale data remains visible and isStale may be true
      // The important thing is isDataReady stays true and data is still the old data
      expect(result.current.isDataReady).toBe(true);
      expect(result.current.data).toEqual(initialData);

      // Resolve the refetch
      const newData = [{ id: 2, name: 'New' }];
      act(() => {
        resolveRefetch!(newData);
      });

      // Eventually new data appears
      await waitFor(() => {
        expect(result.current.data).toEqual(newData);
      });
    });
  });

  describe('data defaults', () => {
    it('returns empty array for data when query is pending', () => {
      const { Wrapper } = createQueryClientWrapper();

      const queryFn = () => new Promise<string[]>(() => {});

      const { result } = renderHook(
        () => useDataTable({ queryKey: ['test-default'], queryFn }),
        { wrapper: Wrapper },
      );

      expect(result.current.data).toEqual([]);
    });
  });
});

// ─── useDelayedLoading Tests ────────────────────────────────────────────────────

describe('useDelayedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false immediately when loading starts', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 200));

    // Should be false initially — delay has not elapsed
    expect(result.current).toBe(false);
  });

  it('returns true after the delay has elapsed while still loading', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 200));

    expect(result.current).toBe(false);

    // Advance time past the delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(true);
  });

  it('resets to false when loading stops before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, 200),
      { initialProps: { isLoading: true } },
    );

    expect(result.current).toBe(false);

    // Advance time but NOT past the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(false);

    // Stop loading before delay fires
    rerender({ isLoading: false });

    expect(result.current).toBe(false);

    // Even after more time passes, it remains false
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(false);
  });

  it('resets to false when loading stops after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, 200),
      { initialProps: { isLoading: true } },
    );

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(true);

    // Stop loading
    rerender({ isLoading: false });

    expect(result.current).toBe(false);
  });

  it('uses default delay of 200ms when not specified', () => {
    const { result } = renderHook(() => useDelayedLoading(true));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(true);
  });
});
