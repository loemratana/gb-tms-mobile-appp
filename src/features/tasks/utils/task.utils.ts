import { priorityTone, taskStatusTone, toneColors } from "@/styles";
import type { Task, TaskActivity, TaskPriority, TaskStatus, TaskSubtaskSummary } from "@/features/tasks/types/taskView.types";

export const getStatusColor = (status: TaskStatus): string =>
  toneColors[taskStatusTone[status]].color;

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case "todo":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "review":
      return "Review";
    case "done":
      return "Done";
    case "cancelled":
      return "Cancelled";
  }
};

export const getCategoryLabel = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const getPriorityColor = (priority: TaskPriority): string =>
  toneColors[priorityTone[priority]].color;

export const getPriorityLabel = (priority: TaskPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** A task is overdue once its due date has passed and it's still open. */
export function isTaskOverdue(task: Pick<Task, "status" | "dueDate" | "isOverdue">): boolean {
  // Prefer the server's flag: it uses the business timezone, the same rule as the late-submission check.
  if (task.isOverdue !== undefined) return task.isOverdue;
  if (task.status === "done" || task.status === "cancelled") return false;
  return new Date(`${task.dueDate}T23:59:59`).getTime() < Date.now();
}

const clampPercent = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

/**
 * Progress shown on cards. The server derives it (TODO 0, IN_PROGRESS/REJECTED/BLOCKED 25,
 * IN_REVIEW 50, APPROVED/DONE 100, CANCELLED 0, or the average of the subtasks), so the app
 * shows it as-is rather than re-deriving it from the collapsed view status.
 */
export function getTaskDisplayProgress(task: { progress: number }): number {
  return clampPercent(task.progress);
}

export function isSubtask(task: Pick<Task, "parentId">): boolean {
  return Boolean(task.parentId);
}

/**
 * The rows of a task list: a subtask renders nested inside its parent's card, so it's only dropped
 * as a row when that parent is in the list too. Otherwise (e.g. your own copy of a group task, whose
 * parent you aren't on) it's a row of its own. The server's `excludeNestedSubtasks` count filter
 * applies the same rule, so dashboard numbers match the list.
 */
export function toListRows(tasks: Task[]): Task[] {
  const listedIds = new Set(tasks.map((task) => task.id));
  return tasks.filter((task) => !isSubtask(task) || !task.parentId || !listedIds.has(task.parentId));
}

export function getSubtasksForParent(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((task) => task.parentId === parentId);
}

function toSubtaskSummary(task: Task): TaskSubtaskSummary {
  const assignee = task.assignees[0];

  return {
    id: task.id,
    title: task.title,
    status: task.status,
    progress: getTaskDisplayProgress(task),
    assigneeName: assignee?.name ?? "Unassigned",
    assigneeAvatarUrl: assignee?.avatarUrl,
  };
}

export function getSubtaskWorkProgress(subtask: TaskSubtaskSummary): number {
  if (subtask.status === "done") return 100;
  return clampPercent(subtask.progress);
}

export function resolveTaskSubtasks(
  tasks: Task[],
  parent: Task,
): TaskSubtaskSummary[] {
  const linked = getSubtasksForParent(tasks, parent.id);
  if (linked.length > 0) {
    return linked.map(toSubtaskSummary);
  }

  return (parent.subtasks ?? []).map((subtask) => ({
    ...subtask,
    progress: subtask.progress ?? 0,
    assigneeName: subtask.assigneeName ?? "Unassigned",
    assigneeAvatarUrl: subtask.assigneeAvatarUrl,
  }));
}

/** Average of the subtasks' progress, skipping cancelled ones — the same rule the server uses for a parent. */
export function getSubtaskCompletionProgress(subtasks: TaskSubtaskSummary[]): number {
  const countable = subtasks.filter((subtask) => subtask.status !== "cancelled");
  if (countable.length === 0) return 0;
  const total = countable.reduce(
    (sum, subtask) => sum + getSubtaskWorkProgress(subtask),
    0,
  );
  return Math.round(total / countable.length);
}

export function getSubtaskFullTask(tasks: Task[], subtaskId: string): Task | undefined {
  return tasks.find((task) => task.id === subtaskId);
}

export function getLatestWorkActivity(task: Task): TaskActivity | undefined {
  return (
    task.activities?.find((activity) => activity.type === "work_update") ??
    task.activities?.[0]
  );
}
