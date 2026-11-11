import type { Task } from "@/features/tasks/types/taskView.types";

export type MyWorkFilter = "today" | "upcoming" | "done";

export type MyWorkGroups = Record<MyWorkFilter, Task[]>;

function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const isOpen = (task: Task) => task.status !== "done" && task.status !== "cancelled";
const dueKey = (task: Task) => task.dueDate.slice(0, 10);

/**
 * Splits the user's tasks into the dashboard's three views:
 * - today: open tasks due today or already overdue (most urgent first)
 * - upcoming: open tasks due after today (soonest first)
 * - done: completed tasks (most recent due date first)
 */
export function groupMyWork(tasks: Task[], now = new Date()): MyWorkGroups {
  const today = toDateKey(now);
  const open = tasks.filter(isOpen);

  return {
    today: open.filter((task) => dueKey(task) <= today).sort((a, b) => dueKey(a).localeCompare(dueKey(b))),
    upcoming: open.filter((task) => dueKey(task) > today).sort((a, b) => dueKey(a).localeCompare(dueKey(b))),
    done: tasks
      .filter((task) => task.status === "done")
      .sort((a, b) => dueKey(b).localeCompare(dueKey(a))),
  };
}
