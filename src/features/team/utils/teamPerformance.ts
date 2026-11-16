import type { LeaderboardEntry } from "@/features/team/types/leaderboard.types";
import type { TeamRosterMember } from "@/features/team/types/team.types";

/**
 * Rated teammates by rank (best first), then everyone else in roster order, so the list reads as
 * the department's ranking while still listing the whole team.
 */
export function sortByPerformance(
  members: TeamRosterMember[],
  entriesByUserId: ReadonlyMap<string, LeaderboardEntry>,
): TeamRosterMember[] {
  const rankOf = (member: TeamRosterMember): number => {
    const entry = entriesByUserId.get(member.id);
    return entry?.rated && entry.rank !== null ? entry.rank : Number.MAX_SAFE_INTEGER;
  };
  // Array.prototype.sort is stable, so equal ranks (the unrated) keep their roster order.
  return [...members].sort((a, b) => rankOf(a) - rankOf(b));
}
