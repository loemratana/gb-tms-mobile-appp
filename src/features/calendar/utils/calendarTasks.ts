import { addDays, formatWeekDividerLabel, parseDateKey, toDateKey } from "./calendarDates";
import { apiTaskStatusTone, toneColors, type Tone } from "@/styles";
import type { TaskResponse, TaskStatus } from "@/features/tasks/types/task.types";

export const TASK_STATUS_COLORS = Object.fromEntries(
  Object.entries(apiTaskStatusTone).map(([status, tone]) => [status, toneColors[tone].color]),
) as Record<TaskStatus, string>;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DONE: "Done",
  BLOCKED: "Blocked",
  CANCELLED: "Cancelled",
};

const OPEN_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "REJECTED"];

export function isTaskOverdue(task: TaskResponse): boolean {
  if (!task.dueDate || !OPEN_STATUSES.includes(task.status)) return false;
  return task.dueDate < toDateKey(new Date());
}

/** Overdue open tasks render red regardless of status, matching the old mock's "overdue" treatment. */
export function getTaskColor(task: TaskResponse): string {
  return isTaskOverdue(task) ? toneColors.error.color : TASK_STATUS_COLORS[task.status];
}

/** Badge tone for a task: overdue open tasks read as an error whatever their status. */
export function getTaskTone(task: TaskResponse): Tone {
  return isTaskOverdue(task) ? "error" : apiTaskStatusTone[task.status];
}

export type MonthSummary = { total: number; overdue: number; done: number };

/** Counts for the tasks due in the month containing `monthDate`. */
export function getMonthSummary(tasks: TaskResponse[], monthDate: Date): MonthSummary {
  const monthPrefix = toDateKey(monthDate).slice(0, 7);
  const summary: MonthSummary = { total: 0, overdue: 0, done: 0 };
  for (const task of tasks) {
    if (!task.dueDate?.startsWith(monthPrefix)) continue;
    summary.total += 1;
    if (isTaskOverdue(task)) summary.overdue += 1;
    if (task.status === "DONE" || task.status === "APPROVED") summary.done += 1;
  }
  return summary;
}

export function getTasksForDate(tasks: TaskResponse[], dateKey: string): TaskResponse[] {
  return tasks
    .filter((task) => task.dueDate === dateKey)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export type TaskAgendaEntry =
  | { kind: "day"; date: Date; tasks: TaskResponse[] }
  | { kind: "gap"; label: string };

/** Groups tasks by due date, sorted chronologically, with a "Week N, ..." divider inserted wherever a day is skipped. Tasks with no due date can't be placed on a calendar and are dropped. */
export function buildTaskAgendaEntries(tasks: TaskResponse[]): TaskAgendaEntry[] {
  const byDate = new Map<string, TaskResponse[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = byDate.get(task.dueDate) ?? [];
    list.push(task);
    byDate.set(task.dueDate, list);
  }

  const sortedKeys = Array.from(byDate.keys()).sort();
  const entries: TaskAgendaEntry[] = [];
  let previousDate: Date | null = null;

  for (const key of sortedKeys) {
    const date = parseDateKey(key);
    if (previousDate && date.getTime() - previousDate.getTime() > 86400000) {
      entries.push({ kind: "gap", label: formatWeekDividerLabel(addDays(previousDate, 1)) });
    }

    entries.push({
      kind: "day",
      date,
      tasks: (byDate.get(key) ?? []).sort((a, b) => a.title.localeCompare(b.title)),
    });
    previousDate = date;
  }

  return entries;
}
