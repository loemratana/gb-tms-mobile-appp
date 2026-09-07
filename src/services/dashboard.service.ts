import { api, type ApiEnvelope } from "@/lib/api";
import type { TeamAnalytics } from "@/features/manager/types/analytics.types";

/** Manager-only — the caller's direct reports (manager_id-driven, not department membership). */
export async function getTeamAnalytics(): Promise<TeamAnalytics> {
  const { data } = await api.get<ApiEnvelope<TeamAnalytics>>("/dashboard/team-summary");
  return data.data;
}
