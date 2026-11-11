import { isTaskOverdue } from "./task.utils";
import type { TaskCountsResponse } from "@/features/tasks/types/task.types";
import type { Task } from "@/features/tasks/types/taskView.types";

export type TaskStatCounts = {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

/** Same numbers as {@link computeTaskStatCounts}, from server counts (`GET /tasks/counts`). */
export function toTaskStatCounts(counts: TaskCountsResponse | undefined): TaskStatCounts {
  const by = counts?.byStatus;
  return {
    total: counts?.total ?? 0,
    inProgress: (by?.IN_PROGRESS ?? 0) + (by?.REJECTED ?? 0),
    completed: (by?.DONE ?? 0) + (by?.APPROVED ?? 0),
    overdue: counts?.overdue ?? 0,
  };
}

export function computeTaskStatCounts(tasks: Task[]): TaskStatCounts {
  return {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter(isTaskOverdue).length,
  };
}
