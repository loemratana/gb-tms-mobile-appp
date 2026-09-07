import type { Task, TaskActivity, TaskPriority, TaskStatus, TaskSubtaskSummary } from "../types/types";

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "todo":
      return "#6B7280";
    case "in_progress":
      return "#2563EB";
    case "review":
      return "#F59E0B";
    case "done":
      return "#22C55E";
    case "cancelled":
      return "#EF4444";
  }
};

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

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "low":
      return "#6B7280";
    case "medium":
      return "#2563EB";
    case "high":
      return "#F59E0B";
    case "urgent":
      return "#EF4444";
  }
};

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
export function isTaskOverdue(task: Pick<Task, "status" | "dueDate">): boolean {
  if (task.status === "done" || task.status === "cancelled") return false;
  return new Date(`${task.dueDate}T23:59:59`).getTime() < Date.now();
}

/** Progress shown on cards — aligned with task status lifecycle */
export function getTaskDisplayProgress(task: {
  status: TaskStatus;
  progress: number;
}): number {
  switch (task.status) {
    case "done":
      return 100;
    case "review":
      return Math.max(task.progress, 90);
    case "todo":
    case "cancelled":
      return Math.min(task.progress, 10);
    default:
      return task.progress;
  }
}

export function isSubtask(task: Pick<Task, "parentId">): boolean {
  return Boolean(task.parentId);
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
  return subtask.progress;
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

export function getSubtaskCompletionProgress(subtasks: TaskSubtaskSummary[]): number {
  if (subtasks.length === 0) return 0;
  const total = subtasks.reduce(
    (sum, subtask) => sum + getSubtaskWorkProgress(subtask),
    0,
  );
  return Math.round(total / subtasks.length);
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
