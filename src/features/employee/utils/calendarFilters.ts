import type { TaskPriority, TaskStatus } from "@/features/employee/types/types";

export type CalendarFilters = {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
};

export const ALL_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done", "cancelled"];
export const ALL_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const EMPTY_FILTERS: CalendarFilters = {
  statuses: [],
  priorities: [],
};

export function countActiveFilters(filters: CalendarFilters) {
  return filters.statuses.length + filters.priorities.length;
}

export function applyCalendarFilters<T extends { status: TaskStatus; priority: TaskPriority }>(
  tasks: T[],
  filters: CalendarFilters,
): T[] {
  return tasks.filter((task) => {
    const statusOk = filters.statuses.length === 0 || filters.statuses.includes(task.status);
    const priorityOk =
      filters.priorities.length === 0 || filters.priorities.includes(task.priority);
    return statusOk && priorityOk;
  });
}
