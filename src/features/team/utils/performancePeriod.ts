import { addDays, parseDateKey, toDateKey } from "@/features/calendar/utils/calendarDates";
import type { UserPerformanceParams } from "@/features/users/types/user.types";

export type PerformancePreset = "all" | "30d" | "90d" | "year";

/** A quick preset, or a custom range picked on the calendar ("YYYY-MM-DD", inclusive). */
export type PerformanceRange =
  | { kind: PerformancePreset }
  | { kind: "custom"; from: string; to: string };

export const PERFORMANCE_PRESETS: { value: PerformancePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
];

export const DEFAULT_PERFORMANCE_RANGE: PerformanceRange = { kind: "all" };

/** Date range sent to GET /users/{id}/performance; presets end today. Filters by task creation date. */
export function toPerformanceParams(range: PerformanceRange, today: Date = new Date()): UserPerformanceParams {
  const to = toDateKey(today);
  switch (range.kind) {
    case "custom":
      return { from: range.from, to: range.to };
    case "30d":
      return { from: toDateKey(addDays(today, -29)), to };
    case "90d":
      return { from: toDateKey(addDays(today, -89)), to };
    case "year":
      return { from: toDateKey(new Date(today.getFullYear(), 0, 1)), to };
    default:
      return {};
  }
}

function formatDay(dateKey: string, withYear: boolean): string {
  return parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** Button label: "Last 30 days", or "14 Oct – 12 Nov 2026" / "3 Nov 2026" for a custom range. */
export function formatPerformanceRange(range: PerformanceRange): string {
  if (range.kind !== "custom") {
    return PERFORMANCE_PRESETS.find((preset) => preset.value === range.kind)?.label ?? "All time";
  }
  if (range.from === range.to) return formatDay(range.from, true);
  const isSameYear = range.from.slice(0, 4) === range.to.slice(0, 4);
  return `${formatDay(range.from, !isSameYear)} – ${formatDay(range.to, true)}`;
}

/**
 * The period's two ends as display labels, so every choice reads "From … To …":
 * "All time" has no start ("Beginning") and ends today.
 */
export function getRangeEndpoints(range: PerformanceRange, today: Date = new Date()): { from: string; to: string } {
  const params = toPerformanceParams(range, today);
  return {
    from: params.from ? formatDay(params.from, true) : "Beginning",
    to: params.to ? formatDay(params.to, true) : "Today",
  };
}

type PeriodMarking = {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
};

/** react-native-calendars "period" marks for every day from `from` to `to` (or just `from`). */
export function buildRangeMarks(
  from: string,
  to: string | null,
  colors: { edge: string; edgeText: string; middle: string; middleText: string },
): Record<string, PeriodMarking> {
  const end = to ?? from;
  const marks: Record<string, PeriodMarking> = {};
  for (let day = parseDateKey(from); toDateKey(day) <= end; day = addDays(day, 1)) {
    const key = toDateKey(day);
    const isEdge = key === from || key === end;
    marks[key] = {
      startingDay: key === from,
      endingDay: key === end,
      color: isEdge ? colors.edge : colors.middle,
      textColor: isEdge ? colors.edgeText : colors.middleText,
    };
  }
  return marks;
}
