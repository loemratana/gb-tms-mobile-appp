export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DONE"
  | "BLOCKED"
  | "CANCELLED";

/** Server-enforced transitions for `PATCH /{id}/status`. `BLOCKED` isn't reachable via the transition map. */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  REJECTED: ["IN_PROGRESS", "CANCELLED"],
  APPROVED: ["DONE"],
  DONE: [],
  CANCELLED: [],
  BLOCKED: [],
};

export type TaskParticipant = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type TaskDepartment = {
  id: string;
  name: string;
};

export type TaskResponse = {
  id: string;
  taskCode: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  creator: TaskParticipant | null;
  assignedBy: TaskParticipant | null;
  assignee: TaskParticipant | null;
  /** Everyone assigned to this task — the primary assignee plus any additional
   * collaborators added via POST /{id}/assignees, deduplicated. */
  assignees: TaskParticipant[];
  department: TaskDepartment | null;
  parentTaskId: string | null;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  progress: number;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  priority: Priority;
  status?: TaskStatus;
  departmentId: string;
  assigneeId?: string;
  parentTaskId?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
};

export type UpdateTaskRequest = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
};

export type AssignTaskRequest = {
  assigneeId: string;
};

/** POST /tasks/{id}/assignees — adds additional collaborators beyond the primary assignee. */
export type AssignMultipleUsersRequest = {
  userIds: string[];
};

export type AssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export type TaskAssignmentResponse = {
  id: string;
  taskId: string;
  user: TaskParticipant | null;
  assignedBy: TaskParticipant | null;
  status: AssignmentStatus;
  assignedAt: string | null;
};

export type TaskSearchParams = {
  taskStatus?: TaskStatus;
  priority?: Priority;
  departmentId?: string;
  assigneeId?: string;
  createdById?: string;
  assignedById?: string;
  titleContains?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type TaskReminderSettingsResponse = {
  taskId: string;
  enabled: boolean;
  timezone: string;
  reminderTimes: string[];
};

export type UpdateTaskReminderSettingsRequest = {
  enabled?: boolean;
  timezone?: string;
  reminderTimes?: string[];
};

export type TaskCommentResponse = {
  id: string;
  content: string;
  author: TaskParticipant | null;
  createdAt: string;
};

export type CreateTaskCommentRequest = {
  content: string;
};

/** Completion-rate KPI derived from the caller's own assigned tasks — no manager score or rank. */
export type KpiSummaryResponse = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  kpi: number;
};

export type ManagerAssignedMemberWorkload = {
  memberId: string;
  memberName: string;
  avatarUrl?: string | null;
  taskCount: number;
};

export type ManagerAssignedDailyCompletion = {
  date: string;
  count: number;
};

export type ManagerAssignedMemberPerformance = {
  memberId: string;
  memberName: string;
  avatarUrl: string | null;
  positionName: string | null;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeRate: number;
};

/** Dashboard KPI + chart data for tasks the caller (a manager) assigned — scoped by assignedBy. */
export type ManagerAssignedKpiResponse = {
  totalTasks: number;
  pendingTasks: number;
  todoTasks: number;
  reviewTasks: number;
  doneTasks: number;
  rejectedTasks: number;
  overdueTasks: number;
  memberWorkload: ManagerAssignedMemberWorkload[];
  weeklyCompletions: ManagerAssignedDailyCompletion[];
  /** Ranked by completionRate desc, then totalTasks desc. */
  topPerformers: ManagerAssignedMemberPerformance[];
};
