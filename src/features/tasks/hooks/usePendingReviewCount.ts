import { usePendingReviewSubmissions } from "./useSubmissions";

type PendingReviewCount = {
  count: number;
  refetch: () => void;
};

/**
 * How many submissions are waiting for this user's review. Fetches a one-row page (only the total
 * is needed), and every caller shares that cached query: the dashboard card, its shortcut row and
 * the tab badge cost one request.
 */
export function usePendingReviewCount(enabled = true): PendingReviewCount {
  const { data, refetch } = usePendingReviewSubmissions({ size: 1 }, enabled);
  return {
    count: enabled ? (data?.totalElements ?? 0) : 0,
    refetch: () => void refetch(),
  };
}
