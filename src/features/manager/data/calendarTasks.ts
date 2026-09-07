import { palette } from "@/styles";
import { addDays, formatWeekDividerLabel, parseDateKey, toDateKey } from "@/features/manager/data/timeline";
import type { Priority, TaskResponse, TaskStatus } from "@/features/tasks/types/task.types";

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: palette.gray[500],
  IN_PROGRESS: palette.blue[600],
  IN_REVIEW: palette.violet[500],
  APPROVED: palette.green[600],
  REJECTED: palette.red[600],
  DONE: palette.green.brand,
  BLOCKED: palette.amber[600],
  CANCELLED: palette.gray[600],
};

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

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: palette.gray[400],
  MEDIUM: palette.blue[500],
  HIGH: palette.amber[500],
  URGENT: palette.red[500],
};

const OPEN_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "REJECTED"];

export function isTaskOverdue(task: TaskResponse): boolean {
  if (!task.dueDate || !OPEN_STATUSES.includes(task.status)) return false;
  return task.dueDate < toDateKey(new Date());
}

/** Overdue open tasks render red regardless of status, matching the old mock's "overdue" treatment. */
export function getTaskColor(task: TaskResponse): string {
  return isTaskOverdue(task) ? palette.red[500] : TASK_STATUS_COLORS[task.status];
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
