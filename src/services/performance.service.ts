import { api, type ApiEnvelope } from "@/lib/api";
import type { PerformanceAward } from "@/features/team/types/award.types";
import type { LeaderboardParams, LeaderboardResponse } from "@/features/team/types/leaderboard.types";

/** Department top performers for a month or quarter; open to every signed-in user. */
export async function getLeaderboard(params: LeaderboardParams): Promise<LeaderboardResponse> {
  const { data } = await api.get<ApiEnvelope<LeaderboardResponse>>("/performance/leaderboard", { params });
  return data.data;
}

/** Monthly / yearly announcements for the viewer's department they haven't closed yet, newest first. */
export async function getPendingAwards(): Promise<PerformanceAward[]> {
  const { data } = await api.get<ApiEnvelope<PerformanceAward[]>>("/performance/awards/pending");
  return data.data;
}

/** One announcement with everyone who was rated. */
export async function getAward(id: string): Promise<PerformanceAward> {
  const { data } = await api.get<ApiEnvelope<PerformanceAward>>(`/performance/awards/${id}`);
  return data.data;
}

/** The viewer closed the popup; it won't show again. */
export async function markAwardSeen(id: string): Promise<void> {
  await api.post(`/performance/awards/${id}/seen`);
}
