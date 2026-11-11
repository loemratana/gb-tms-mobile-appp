import { useMemo, useState } from "react";

import { useTaskMonthlyCounts } from "@/features/tasks/hooks/useTasks";
import type { TaskSearchParams } from "@/features/tasks/types/task.types";
import {
  toMonthlyTaskCounts,
  type MonthlyTaskCount,
} from "@/features/dashboard/utils/taskStatistics";

type TasksPerMonth = {
  year: number;
  months: MonthlyTaskCount[];
  /** Highlighted in the chart; `null` when viewing another year. */
  currentMonth: number | null;
  isCurrentYear: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  goToPreviousYear: () => void;
  goToNextYear: () => void;
  goToCurrentYear: () => void;
};

/**
 * Monthly task totals (by due date) for one year, with year navigation.
 * Counted on the server, so the numbers aren't capped by a fetched page.
 */
export function useTasksPerMonth(params: TaskSearchParams, enabled = true): TasksPerMonth {
  const now = new Date();
  const thisYear = now.getFullYear();
  const [year, setYear] = useState(thisYear);

  const { data, isLoading, isError, refetch } = useTaskMonthlyCounts(year, params, enabled);
  const months = useMemo(() => toMonthlyTaskCounts(data?.months), [data]);
  const isCurrentYear = year === thisYear;

  return {
    year,
    months,
    currentMonth: isCurrentYear ? now.getMonth() : null,
    isCurrentYear,
    isLoading,
    isError,
    refetch: () => void refetch(),
    goToPreviousYear: () => setYear((value) => value - 1),
    goToNextYear: () => setYear((value) => value + 1),
    goToCurrentYear: () => setYear(thisYear),
  };
}
