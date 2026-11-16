import type { LeaderboardPeriod } from "@/features/team/types/leaderboard.types";

export type AwardPeriod = LeaderboardPeriod | "YEARLY";

export type PerformanceAwardEntry = {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  positionName: string | null;
  score: number;
  /** 1 to 5 in half steps. */
  stars: number;
  tasks: number;
};

/** A published (frozen) top-performer announcement — GET /performance/awards/pending and /awards/{id}. */
export type PerformanceAward = {
  id: string;
  departmentId: string;
  departmentName: string;
  period: AwardPeriod;
  year: number;
  /** Month (1-12) or quarter (1-4); null for YEARLY. */
  number: number | null;
  /** "November 2026", "Q4 2026" or "2026". */
  label: string;
  from: string;
  to: string;
  publishedAt: string;
  ratedCount: number;
  /** Top 3 in a pending award; everyone rated from GET /awards/{id}. */
  entries: PerformanceAwardEntry[];
  /** The viewer's own place, when they were rated. */
  myEntry: PerformanceAwardEntry | null;
};
