import { isTaskOverdue } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

export type DateFilterPreset =
  | "all"
  | "today"
  | "tomorrow"
  | "this_week"
  | "this_month"
  | "overdue";

export type TaskListFilters = {
  datePreset: DateFilterPreset;
  dateFrom: string | null;
  dateTo: string | null;
};

export const EMPTY_TASK_FILTERS: TaskListFilters = {
  datePreset: "all",
  dateFrom: null,
  dateTo: null,
};

export const DATE_PRESETS: { key: DateFilterPreset; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "overdue", label: "Overdue" },
];

export function hasActiveTaskFilters(filters: TaskListFilters) {
  return (
    filters.datePreset !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo)
  );
}

export type ActiveFilterChipId = "datePreset" | "dateRange";

export type ActiveFilterChip = {
  id: ActiveFilterChipId;
  label: string;
};

function formatShortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getActiveFilterChips(filters: TaskListFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom ? formatShortDate(filters.dateFrom) : "Any";
    const to = filters.dateTo ? formatShortDate(filters.dateTo) : "Any";
    chips.push({ id: "dateRange", label: `${from} – ${to}` });
  } else if (filters.datePreset !== "all") {
    const preset = DATE_PRESETS.find((item) => item.key === filters.datePreset);
    chips.push({
      id: "datePreset",
      label: preset?.label ?? filters.datePreset,
    });
  }

  return chips;
}

export function removeActiveFilterChip(
  filters: TaskListFilters,
  chipId: ActiveFilterChipId,
): TaskListFilters {
  switch (chipId) {
    case "datePreset":
      return { ...filters, datePreset: "all" };
    case "dateRange":
      return { ...filters, dateFrom: null, dateTo: null };
    default:
      return filters;
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  return addDays(date, -day);
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function parseTaskDate(value: string) {
  return startOfDay(new Date(`${value}T12:00:00`));
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function matchesTaskDateFilter(
  task: Pick<Task, "dueDate" | "status">,
  filters: TaskListFilters,
): boolean {
  const due = parseTaskDate(task.dueDate);

  if (filters.dateFrom || filters.dateTo) {
    if (filters.dateFrom && due < parseTaskDate(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && due > parseTaskDate(filters.dateTo)) {
      return false;
    }
    return true;
  }

  const today = startOfDay(new Date());

  switch (filters.datePreset) {
    case "all":
      return true;
    case "today":
      return isSameDay(due, today);
    case "tomorrow":
      return isSameDay(due, addDays(today, 1));
    case "this_week":
      return due >= startOfWeek(today) && due <= endOfWeek(today);
    case "this_month":
      return (
        due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear()
      );
    case "overdue":
      return isTaskOverdue(task);
    default:
      return true;
  }
}
