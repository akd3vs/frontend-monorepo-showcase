import { useEffect, useRef, useState } from 'react';

/**
 * A hook that returns `true` only after the given `isLoading` state has been
 * active for at least `delayMs` milliseconds.
 *
 * This prevents brief loading indicators from flashing during fast fetches,
 * providing a smoother user experience for data refetches.
 *
 * @param isLoading - Whether a loading operation is currently in progress.
 * @param delayMs - Minimum time in ms before showing the indicator. Defaults to 200.
 * @returns `true` when loading has exceeded the delay threshold.
 *
 * @example
 * ```tsx
 * const showLoadingBar = useDelayedLoading(query.isFetching, 200);
 * return (
 *   <>
 *     {showLoadingBar && <ProgressBar />}
 *     <TableContent />
 *   </>
 * );
 * ```
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 200): boolean {
  const [showIndicator, setShowIndicator] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => {
        setShowIndicator(true);
      }, delayMs);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowIndicator(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, delayMs]);

  return showIndicator;
}
