import { useCanGoBack, useRouter } from "expo-router";

/**
 * `router.back` when there is a screen to return to, otherwise undefined — pass it straight to a
 * header's `onBack` so the back button only shows when it can work.
 *
 * Uses `useCanGoBack()` (reactive, re-renders on every navigation change) rather than
 * `router.canGoBack()`, which is a one-off read: tab screens stay mounted, so the one-off value went
 * stale and the button only appeared after something else (e.g. a pull-to-refresh) re-rendered.
 */
export function useBackAction(): (() => void) | undefined {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return canGoBack ? router.back : undefined;
}
