import type { StatusFilter, Task } from "@/features/tasks/types/taskView.types";
import { isTaskOverdue } from "@/features/tasks/utils/task.utils";

/** Every list tab, in display order. */
export const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "todo",
  "in_progress",
  "review",
  "done",
  "overdue",
  "cancelled",
];

/** Narrows an untrusted value (e.g. a route param) to a list tab. */
export function isStatusFilter(value: unknown): value is StatusFilter {
  return typeof value === "string" && (STATUS_FILTERS as readonly string[]).includes(value);
}

/**
 * Buckets use the UI status from `taskResponseAdapter` — the same buckets the dashboard
 * counts with (`toTaskStatCounts` / `toTaskStatusCounts`): REJECTED is "in_progress",
 * BLOCKED is "todo", APPROVED is "done". Overdue = past due and not done/cancelled,
 * matching the server's `overdue` count.
 */
export function matchesTaskStatusFilter(task: Task, status: StatusFilter): boolean {
  if (status === "all") return true;
  if (status === "overdue") return isTaskOverdue(task);
  return task.status === status;
}

export function matchesTaskSearch(task: Task, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.description.toLowerCase().includes(normalized) ||
    task.assignedManager.name.toLowerCase().includes(normalized) ||
    (task.category?.toLowerCase().includes(normalized) ?? false) ||
    (task.taskType?.toLowerCase().includes(normalized) ?? false)
  );
}
