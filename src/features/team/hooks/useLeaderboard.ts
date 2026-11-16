import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getLeaderboard } from "@/services/performance.service";
import type { LeaderboardParams } from "@/features/team/types/leaderboard.types";

export const leaderboardKeys = {
  all: ["performance", "leaderboard"] as const,
  detail: (params: LeaderboardParams) => [...leaderboardKeys.all, params] as const,
};

export function useLeaderboard(params: LeaderboardParams, enabled = true) {
  return useQuery({
    queryKey: leaderboardKeys.detail(params),
    queryFn: () => getLeaderboard(params),
    enabled,
    // Keep the previous period on screen while the next one loads.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
