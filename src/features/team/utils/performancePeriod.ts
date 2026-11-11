import type { SegmentOption } from "@/components/ui/SegmentedControl";
import { addDays, toDateKey } from "@/features/calendar/utils/calendarDates";
import type { UserPerformanceParams } from "@/features/users/types/user.types";

export type PerformancePeriod = "all" | "30d" | "90d" | "year";

export const PERFORMANCE_PERIOD_OPTIONS: SegmentOption<PerformancePeriod>[] = [
  { value: "all", label: "All" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "This year" },
];

/** Date range sent to GET /users/{id}/performance; ranges end today and filter by task creation date. */
export function toPerformanceParams(period: PerformancePeriod, today: Date = new Date()): UserPerformanceParams {
  const to = toDateKey(today);
  switch (period) {
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
