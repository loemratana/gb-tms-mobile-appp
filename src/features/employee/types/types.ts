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
  project?: string;
  team?: string;
  taskType?: string;
  parentId?: string;
  subtasks?: TaskSubtaskSummary[];
  activities?: TaskActivity[];
}
