import { isTaskOverdue } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

const DEFAULT_ACTIVE_TASKS_LIMIT = 8;

/** Non-finished tasks, soonest due first — "what's active right now" for a dashboard preview. */
export function selectActiveTasks(tasks: Task[], limit = DEFAULT_ACTIVE_TASKS_LIMIT): Task[] {
  return tasks
    .filter((task) => task.status !== "done" && task.status !== "cancelled")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}

export type TaskStatCounts = {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

export function computeTaskStatCounts(tasks: Task[]): TaskStatCounts {
  return {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter(isTaskOverdue).length,
  };
}
