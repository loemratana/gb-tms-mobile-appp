import type { PerformanceRating, UserPerformanceResponse } from "@/features/users/types/user.types";
import { toneColors, type Tone } from "@/styles";

export const RATING_DISPLAY: Record<PerformanceRating, { label: string; tone: Tone }> = {
  EXCELLENT: { label: "Excellent", tone: "success" },
  GOOD: { label: "Good", tone: "info" },
  AVERAGE: { label: "Average", tone: "warning" },
  NEEDS_IMPROVEMENT: { label: "Needs improvement", tone: "error" },
  NO_DATA: { label: "No tasks yet", tone: "neutral" },
};

/** "3.5 days", "1 day", or "—" when nothing was completed in the period. */
export function formatAvgDays(days: number | null): string {
  if (days === null) return "—";
  const rounded = Math.round(days * 10) / 10;
  return `${rounded} ${rounded === 1 ? "day" : "days"}`;
}

export type ChartSlice = { key: string; label: string; value: number; color: string; percent: number };

function withPercents(slices: Omit<ChartSlice, "percent">[]): ChartSlice[] {
  const visible = slices.filter((slice) => slice.value > 0);
  const total = visible.reduce((sum, slice) => sum + slice.value, 0);
  return visible.map((slice) => ({ ...slice, percent: total ? Math.round((slice.value / total) * 100) : 0 }));
}

/**
 * Assigned tasks split into what happened to them, so the doughnut adds up to Assigned (shown in
 * its centre): completed, overdue (open and past due), still open, and cancelled.
 */
export function getAssignedSlices(performance: UserPerformanceResponse): ChartSlice[] {
  const { tasks } = performance;
  const stillOpen = Math.max(0, tasks.total - tasks.completed - tasks.overdue - tasks.cancelled);
  return withPercents([
    { key: "completed", label: "Completed", value: tasks.completed, color: toneColors.success.color },
    { key: "overdue", label: "Overdue", value: tasks.overdue, color: toneColors.error.color },
    { key: "open", label: "Still open", value: stillOpen, color: toneColors.info.color },
    { key: "cancelled", label: "Cancelled", value: tasks.cancelled, color: toneColors.faint.color },
  ]);
}
