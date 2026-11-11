import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

/** Switching tabs back and forth shouldn't refetch a 200-task page every time. */
const MIN_REFETCH_INTERVAL_MS = 30_000;

/**
 * Refetches when the screen regains focus (e.g. switching back to its tab).
 * Tab screens stay mounted, so React Query's mount-time refetch never fires
 * for them — without this, changes made elsewhere (by an admin, another
 * device…) only appear after a manual refresh. The first focus is skipped
 * because the query already fetches on mount, and refetches are throttled to
 * one per {@link MIN_REFETCH_INTERVAL_MS} per screen.
 */
export function useRefetchOnFocus(refetch: () => unknown): void {
  const isFirstFocus = useRef(true);
  const lastRefetchAt = useRef(0);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        lastRefetchAt.current = now;
        return;
      }
      if (now - lastRefetchAt.current < MIN_REFETCH_INTERVAL_MS) return;
      lastRefetchAt.current = now;
      void refetchRef.current();
    }, []),
  );
}
