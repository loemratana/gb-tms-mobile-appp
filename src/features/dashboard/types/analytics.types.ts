export type TeamStatusCount = {
  status: string;
  count: number;
};

export type TeamMemberWorkload = {
  memberId: string;
  memberName: string;
  avatarUrl: string | null;
  taskCount: number;
};

export type TeamDailyCompletion = {
  /** ISO date string, e.g. "2026-09-02". */
  date: string;
  count: number;
};

export type TeamMemberPerformance = {
  memberId: string;
  memberName: string;
  avatarUrl: string | null;
  positionName: string | null;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeRate: number;
};

/** Mirrors the backend's TeamAnalyticsResponse (GET /dashboard/team-summary). */
export type TeamAnalytics = {
  totalMembers: number;
  totalTasks: number;
  activeTasks: number;
  pendingReview: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  taskStatusBreakdown: TeamStatusCount[];
  memberWorkload: TeamMemberWorkload[];
  weeklyCompletions: TeamDailyCompletion[];
  topPerformers: TeamMemberPerformance[];
};
