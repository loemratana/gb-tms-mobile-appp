import { isSubtask } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

const DEFAULT_DAILY_TASKS_LIMIT = 8;

/** Today's workload — active tasks due or started today first, then other active tasks. */
export function selectDailyTasks(tasks: Task[], limit = DEFAULT_DAILY_TASKS_LIMIT): Task[] {
  const today = new Date().toISOString().split("T")[0];

  const active = tasks.filter(
    (task) => !isSubtask(task) && task.status !== "done" && task.status !== "cancelled",
  );

  const dueToday = active.filter((task) => task.dueDate === today || task.startDate === today);
  const others = active.filter((task) => task.dueDate !== today && task.startDate !== today);

  return [...dueToday, ...others].slice(0, limit);
}
