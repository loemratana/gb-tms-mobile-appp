export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ViewType = "list" | "board" | "calendar";
export type TaskCategory =
  | "work"
  | "personal"
  | "meeting"
  | "design"
  | "development";

export type CategoryFilter = "all" | TaskCategory;
/**
 * Task list tabs. They mirror the dashboard stat cards one-to-one, so tapping a card can
 * open the list on the same set of tasks it counted. "overdue" cuts across statuses.
 */
export type StatusFilter =
  | "all"
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "overdue"
  | "cancelled";

export type TaskPerson = {
  id?: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  role?: string;
};

export type TaskActivity = {
  id: string;
  title: string;
  timestamp: string;
  type: "created" | "status" | "comment" | "assigned" | "work_update";
};

export type TaskSubtaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  assigneeName: string;
  assigneeAvatarUrl?: string;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate?: string;
  progress: number;
  assignees: TaskPerson[];
  assignedManager: TaskPerson;
  time?: string;
  category?: TaskCategory;
  team?: string;
  taskType?: string;
  parentId?: string;
  subtasks?: TaskSubtaskSummary[];
  activities?: TaskActivity[];
  commentCount?: number;
  attachmentCount?: number;
  /** The server's overdue flag (business timezone); undefined from older servers. */
  isOverdue?: boolean;
}
