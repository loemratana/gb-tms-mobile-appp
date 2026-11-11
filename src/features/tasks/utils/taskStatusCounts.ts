import { isSubtask } from "./task.utils";
import type { TaskCountsResponse } from "@/features/tasks/types/task.types";
import type { Task } from "@/features/tasks/types/taskView.types";

export type TaskStatusCounts = {
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
};

/**
 * Same buckets as {@link countTasksByStatus}, from server counts (`GET /tasks/counts`).
 * Mirrors the app's status mapping: BLOCKED reads as to-do, REJECTED as in progress, APPROVED as done.
 */
export function toTaskStatusCounts(counts: TaskCountsResponse | undefined): TaskStatusCounts {
  const by = counts?.byStatus;
  return {
    todo: (by?.TODO ?? 0) + (by?.BLOCKED ?? 0),
    inProgress: (by?.IN_PROGRESS ?? 0) + (by?.REJECTED ?? 0),
    review: by?.IN_REVIEW ?? 0,
    completed: (by?.DONE ?? 0) + (by?.APPROVED ?? 0),
  };
}

/** Top-level task counts per workflow stage. Subtasks are excluded so counts match the Tasks tab. */
export function countTasksByStatus(allTasks: Task[]): TaskStatusCounts {
  const counts: TaskStatusCounts = { todo: 0, inProgress: 0, review: 0, completed: 0 };

  for (const task of allTasks) {
    if (isSubtask(task)) continue;
    if (task.status === "todo") counts.todo += 1;
    else if (task.status === "in_progress") counts.inProgress += 1;
    else if (task.status === "review") counts.review += 1;
    else if (task.status === "done") counts.completed += 1;
  }

  return counts;
}
