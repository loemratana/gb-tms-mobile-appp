export type LeaderboardPeriod = "MONTHLY" | "QUARTERLY";

/** GET /performance/leaderboard query. `month` is used for MONTHLY, `quarter` for QUARTERLY. */
export type LeaderboardParams = {
  /** Omit for the caller's own department. */
  departmentId?: string;
  period: LeaderboardPeriod;
  year: number;
  month?: number;
  quarter?: number;
  limit?: number;
};

export type LeaderboardCounts = {
  tasks: number;
  completed: number;
  onTime: number;
  late: number;
  rejections: number;
  overdue: number;
};

/** Each 0-100; null when there was nothing to measure. */
export type LeaderboardComponents = {
  onTime: number | null;
  quality: number | null;
  completion: number | null;
  overdue: number | null;
  speed: number | null;
};

export type LeaderboardEntry = {
  /** 1-based; null while the person is not rated yet. */
  rank: number | null;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  positionName: string | null;
  rated: boolean;
  /** Final 0-100 score; null with no counted tasks. */
  score: number | null;
  /** 1 to 5 in half steps; null while not rated yet. */
  stars: number | null;
  rawScore: number | null;
  counts: LeaderboardCounts;
  components: LeaderboardComponents;
};

export type LeaderboardResponse = {
  departmentId: string;
  departmentName: string;
  period: LeaderboardPeriod;
  /** "YYYY-MM-DD", inclusive. */
  from: string;
  to: string;
  departmentAverage: number | null;
  minTasksForRating: number;
  /** Rated people by rank, then the unrated by name. */
  entries: LeaderboardEntry[];
};
