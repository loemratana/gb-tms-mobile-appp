import { useMemo, useState } from "react";

import { useLeaderboard } from "@/features/team/hooks/useLeaderboard";
import type { LeaderboardEntry } from "@/features/team/types/leaderboard.types";
import {
  currentSelection,
  toLeaderboardParams,
  type LeaderboardSelection,
} from "@/features/team/utils/leaderboardPeriod";

type TeamPerformance = {
  selection: LeaderboardSelection;
  setSelection: (selection: LeaderboardSelection) => void;
  /** Each teammate's rank, stars and score for the chosen period, by user id. */
  entriesByUserId: ReadonlyMap<string, LeaderboardEntry>;
  /** Tasks someone needs in the period before they're rated. */
  minTasksForRating: number | undefined;
  isLoading: boolean;
  /** Showing the previous period while the newly chosen one loads. */
  isSwitchingPeriod: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * The department leaderboard for a month or quarter, keyed by person so the roster can show each
 * teammate's performance on their own row. Rankings are per department, so pass `enabled` false for
 * viewers who don't belong to one.
 */
export function useTeamPerformance(enabled: boolean): TeamPerformance {
  const [selection, setSelection] = useState<LeaderboardSelection>(() => currentSelection("MONTHLY"));
  const params = useMemo(() => toLeaderboardParams(selection), [selection]);
  const { data, isLoading, isError, isPlaceholderData, refetch } = useLeaderboard(params, enabled);

  const entriesByUserId = useMemo(
    () => new Map((data?.entries ?? []).map((entry) => [entry.userId, entry])),
    [data],
  );

  return {
    selection,
    setSelection,
    entriesByUserId,
    minTasksForRating: data?.minTasksForRating,
    isLoading: enabled && isLoading,
    isSwitchingPeriod: isPlaceholderData,
    isError: enabled && isError,
    refetch: () => void refetch(),
  };
}
