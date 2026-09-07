import type { TeamMemberPerformance } from "@/features/manager/types/analytics.types";

export type PerformanceBadge = "Top Performer" | "Very Good" | "Good" | "Average";

export type TopPerformer = {
  id: string;
  rank: number;
  name: string;
  position: string;
  avatarUrl: string;
  /** completionRate, 0-100. */
  score: number;
  badge: PerformanceBadge;
  tasksCompleted: number;
  onTimeRate: number;
};

export function getPerformanceBadgeEmoji(badge: PerformanceBadge): string {
  if (badge === "Top Performer") return "🏆";
  if (badge === "Very Good") return "⭐";
  if (badge === "Good") return "👍";
  return "•";
}

function badgeForScore(score: number): PerformanceBadge {
  if (score >= 90) return "Top Performer";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  return "Average";
}

function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(name)}`;
}

/** Backend already ranks by completionRate desc, then totalTasks desc — this just reshapes. */
export function toTopPerformers(performers: TeamMemberPerformance[]): TopPerformer[] {
  return performers.map((member, index) => ({
    id: member.memberId,
    rank: index + 1,
    name: member.memberName,
    position: member.positionName ?? "Team member",
    avatarUrl: member.avatarUrl ?? fallbackAvatar(member.memberName),
    score: Math.round(member.completionRate),
    badge: badgeForScore(member.completionRate),
    tasksCompleted: member.completedTasks,
    onTimeRate: Math.round(member.onTimeRate),
  }));
}
