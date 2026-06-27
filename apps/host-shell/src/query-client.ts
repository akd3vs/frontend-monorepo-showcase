import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // Data considered fresh for 30s
      refetchInterval: 60_000, // Background refetch every 60s
      refetchOnWindowFocus: true, // Refetch when tab regains focus
      retry: 3, // Retry failed queries 3 times
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});
