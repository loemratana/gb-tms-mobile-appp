export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_APPROVED"
  | "TASK_REJECTED"
  | "COMMENT"
  | "STATUS_UPDATE"
  | "TASK_REMINDER"
  | "MEETING";

export type NotificationFilter = "all" | "tasks" | "comments" | "updates";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  taskId: string;
  /** Set for meeting room booking notifications (invited, changed, cancelled). */
  meetingId?: string;
  taskName: string;
  sender: string;
  senderAvatarUrl?: string;
  timestamp: string;
  isRead: boolean;
  rejectionReason?: string;
  commentPreview?: string;
  statusFrom?: TaskStatus;
  statusTo?: TaskStatus;
};

export type NotificationSection = {
  title: string;
  data: Notification[];
};

export type NotificationTheme = {
  accent: string;
  iconBg: string;
  label: string;
};
