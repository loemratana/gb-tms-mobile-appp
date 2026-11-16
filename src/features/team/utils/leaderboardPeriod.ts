import type { LeaderboardParams, LeaderboardPeriod } from "@/features/team/types/leaderboard.types";

/** One month (number 1-12) or one quarter (number 1-4) of a year. */
export type LeaderboardSelection = {
  period: LeaderboardPeriod;
  year: number;
  number: number;
};

export const LEADERBOARD_PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const QUARTER_RANGES = ["Jan – Mar", "Apr – Jun", "Jul – Sep", "Oct – Dec"];

export function currentSelection(period: LeaderboardPeriod, today: Date = new Date()): LeaderboardSelection {
  const month = today.getMonth() + 1;
  return {
    period,
    year: today.getFullYear(),
    number: period === "QUARTERLY" ? Math.floor((month - 1) / 3) + 1 : month,
  };
}

/** The previous (-1) or next (+1) month or quarter. */
export function shiftSelection(selection: LeaderboardSelection, delta: number): LeaderboardSelection {
  const perYear = selection.period === "QUARTERLY" ? 4 : 12;
  const index = selection.year * perYear + (selection.number - 1) + delta;
  return { ...selection, year: Math.floor(index / perYear), number: (index % perYear) + 1 };
}

/** True for the current period — there is nothing later to move to. */
export function isCurrentSelection(selection: LeaderboardSelection, today: Date = new Date()): boolean {
  const current = currentSelection(selection.period, today);
  return selection.year === current.year && selection.number === current.number;
}

/** "November 2026" or "Q4 2026". */
export function formatSelection(selection: LeaderboardSelection): string {
  return selection.period === "QUARTERLY"
    ? `Q${selection.number} ${selection.year}`
    : `${MONTH_NAMES[selection.number - 1]} ${selection.year}`;
}

/** "Oct – Dec" for a quarter; null for a month (its name already says it). */
export function formatSelectionHint(selection: LeaderboardSelection): string | null {
  return selection.period === "QUARTERLY" ? QUARTER_RANGES[selection.number - 1] : null;
}

export function toLeaderboardParams(selection: LeaderboardSelection, departmentId?: string): LeaderboardParams {
  return {
    ...(departmentId ? { departmentId } : {}),
    period: selection.period,
    year: selection.year,
    ...(selection.period === "QUARTERLY" ? { quarter: selection.number } : { month: selection.number }),
  };
}

/** "85" or "—". Scores arrive with one decimal; whole numbers read better in a list. */
export function formatScore(score: number | null): string {
  return score === null ? "—" : String(Math.round(score));
}
