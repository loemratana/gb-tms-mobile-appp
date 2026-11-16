import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAward, getPendingAwards, markAwardSeen } from "@/services/performance.service";

export const awardKeys = {
  all: ["performance", "awards"] as const,
  pending: () => [...awardKeys.all, "pending"] as const,
  detail: (id: string) => [...awardKeys.all, "detail", id] as const,
};

/** Re-checked whenever the app comes back to the foreground (React Query focus refetch). */
export function usePendingAwards(enabled = true) {
  return useQuery({
    queryKey: awardKeys.pending(),
    queryFn: getPendingAwards,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useAward(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: awardKeys.detail(id ?? ""),
    queryFn: () => getAward(id as string),
    enabled: enabled && Boolean(id),
    staleTime: Infinity, // a published award never changes
  });
}

export function useMarkAwardSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAwardSeen,
    onSettled: () => queryClient.invalidateQueries({ queryKey: awardKeys.pending() }),
  });
}
