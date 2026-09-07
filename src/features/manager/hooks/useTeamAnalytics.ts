import { useQuery } from "@tanstack/react-query";

import { getTeamAnalytics } from "@/services/dashboard.service";

export const teamAnalyticsKeys = {
  all: ["team-analytics"] as const,
};

export function useTeamAnalytics() {
  return useQuery({
    queryKey: teamAnalyticsKeys.all,
    queryFn: getTeamAnalytics,
    staleTime: 60_000,
  });
}
