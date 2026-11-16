import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import type { TaskResponse, TaskStatus } from "@/features/tasks/types/task.types";
import { apiTaskStatusTone, toneColors, type Tone } from "@/styles";

import { addDays, formatWeekDividerLabel, isInMonth, parseDateKey, toDateKey } from "./calendarDates";

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

export type MonthSummary = { total: number; overdue: number; done: number; meetings: number };

/** Counts for the tasks due, and meetings held, in the month containing `monthDate`. */
export function getMonthSummary(tasks: TaskResponse[], meetings: BookingResponse[], monthDate: Date): MonthSummary {
  const summary: MonthSummary = { total: 0, overdue: 0, done: 0, meetings: 0 };
  for (const task of tasks) {
    if (!task.dueDate || !isInMonth(task.dueDate, monthDate)) continue;
    summary.total += 1;
    if (isTaskOverdue(task)) summary.overdue += 1;
    if (task.status === "DONE" || task.status === "APPROVED") summary.done += 1;
  }
  summary.meetings = meetings.filter((meeting) => isInMonth(meeting.date, monthDate)).length;
  return summary;
}

export function getTasksForDate(tasks: TaskResponse[], dateKey: string): TaskResponse[] {
  return tasks
    .filter((task) => task.dueDate === dateKey)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Meetings on one day, earliest first. */
export function getMeetingsForDate(meetings: BookingResponse[], dateKey: string): BookingResponse[] {
  return meetings
    .filter((meeting) => meeting.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export type AgendaEntry =
  | { kind: "day"; date: Date; meetings: BookingResponse[]; tasks: TaskResponse[] }
  | { kind: "gap"; label: string };

/**
 * The month's days that have meetings or tasks due, in order, with a "Week N, ..." divider wherever
 * days are skipped. Tasks with no due date can't be placed on a calendar and are dropped.
 */
export function buildAgendaEntries(tasks: TaskResponse[], meetings: BookingResponse[], monthDate: Date): AgendaEntry[] {
  const dayKeys = new Set<string>();
  for (const task of tasks) if (task.dueDate && isInMonth(task.dueDate, monthDate)) dayKeys.add(task.dueDate);
  for (const meeting of meetings) if (isInMonth(meeting.date, monthDate)) dayKeys.add(meeting.date);

  const entries: AgendaEntry[] = [];
  let previousDate: Date | null = null;

  for (const key of Array.from(dayKeys).sort()) {
    const date = parseDateKey(key);
    if (previousDate && date.getTime() - previousDate.getTime() > 86400000) {
      entries.push({ kind: "gap", label: formatWeekDividerLabel(addDays(previousDate, 1)) });
    }
    entries.push({
      kind: "day",
      date,
      meetings: getMeetingsForDate(meetings, key),
      tasks: getTasksForDate(tasks, key),
    });
    previousDate = date;
  }

  return entries;
}
