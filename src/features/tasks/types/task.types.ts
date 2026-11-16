import type { TaskAttachmentResponse } from "./attachment.types";

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
  /** Given to several people individually: no assignee, one member subtask each; its status follows
   * the members and it closes itself once every member is approved. Older servers omit it. */
  groupTask?: boolean;
  /** Group tasks only: members counted (active, not cancelled) and how many are approved/done. */
  memberCount?: number | null;
  completedMemberCount?: number | null;
  /** Past dueDate (business timezone) and not finished. On a TODO/IN_PROGRESS/REJECTED task this
   * means submitting work requires a lateReason. Older servers omit it. */
  overdue?: boolean;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** 0–100. The server derives it from status and subtasks; older servers sent null. */
  progress: number | null;
  /** Cheap counts for list/card views, always populated. */
  commentCount?: number;
  attachmentCount?: number;
  /** Full comment/attachment lists — only populated on the single-task detail endpoint (GET /tasks/{id}). */
  comments?: TaskCommentResponse[];
  attachments?: TaskAttachmentResponse[];
};

/** `GET /tasks/counts`: exact counts for the tasks `GET /tasks` would return with the same filters. */
export type TaskCountsResponse = {
  total: number;
  overdue: number;
  /** Keyed by API status; every status is present. */
  byStatus: Record<TaskStatus, number>;
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

/**
 * How a task for several people is set up. INDIVIDUAL (server default): a group task with one
 * subtask per person, each submitted and reviewed separately. SHARED: one task, anyone on it can
 * submit, and one approval completes it for everyone.
 */
export type AssignmentMode = "INDIVIDUAL" | "SHARED";

export type CreateTaskRequest = {
  title: string;
  description?: string;
  priority: Priority;
  status?: TaskStatus;
  departmentId: string;
  /** One person. Use at most one of assigneeId, assigneeIds, assignWholeDepartment, assignPositionId. */
  assigneeId?: string;
  /** Several people, set up per `assignmentMode`. A one-item list is treated as assigneeId. */
  assigneeIds?: string[];
  /** Every active member of departmentId except the creator. */
  assignWholeDepartment?: boolean;
  /** Every active holder of this position except the creator, whatever their department. */
  assignPositionId?: string;
  assignmentMode?: AssignmentMode;
  /** Creates a subtask; with a group task as parent (plus assigneeId) it adds that person to the group. */
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
  /** Only top-level tasks (no subtasks). */
  topLevelOnly?: boolean;
  /**
   * With `assigneeId`: leave out subtasks whose parent is also that person's task — the same rows
   * `toListRows` keeps — so counts match the "My tasks" list. Keeps a group-task member's own subtask.
   */
  excludeNestedSubtasks?: boolean;
  /** Only overdue tasks: due before today and not DONE/APPROVED/CANCELLED. */
  overdue?: boolean;
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
  taskId?: string;
  content: string;
  author: TaskParticipant | null;
  createdAt: string;
  updatedAt?: string;
  /** Client-only: shown right away while the send is in flight (optimistic update). */
  pending?: boolean;
};

export type CreateTaskCommentRequest = {
  content: string;
};

/** Completion-rate KPI derived from the caller's own assigned tasks — no manager score or rank. */
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
