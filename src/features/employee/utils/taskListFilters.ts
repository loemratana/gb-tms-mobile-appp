import type { StatusFilter } from "@/features/employee/components/tasks/StatusFilterChips";
import type { Task } from "@/features/employee/types/types";

/** The "pending" bucket groups not-yet-started and awaiting-review tasks together. */
export function matchesTaskStatusFilter(task: Task, status: StatusFilter): boolean {
  if (status === "all") return true;
  if (status === "pending") {
    return task.status === "todo" || task.status === "review";
  }
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
