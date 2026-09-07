import type {
  Notification,
  NotificationFilter,
  NotificationSection,
  NotificationType,
} from "@/features/employee/types/notification";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDayLabel(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function getNotificationActionText(notification: Notification): string {
  switch (notification.type) {
    case "TASK_ASSIGNED":
      return "Assigned you a task";
    case "TASK_APPROVED":
      return "Approved your task";
    case "TASK_REJECTED":
      return "Rejected your task";
    case "COMMENT":
      return "Commented on your task";
    case "STATUS_UPDATE":
      return "Updated task status";
    case "TASK_REMINDER":
      return "Reminder";
    case "PROJECT_CREATED":
      return "Created a new project";
  }
}

export function getNotificationContentText(notification: Notification): string {
  switch (notification.type) {
    case "TASK_REJECTED":
      return notification.rejectionReason ?? notification.taskName;
    case "COMMENT":
      return notification.commentPreview ?? notification.taskName;
    case "STATUS_UPDATE":
      if (notification.statusFrom && notification.statusTo) {
        return `${notification.taskName} · ${formatStatusLabel(notification.statusFrom)} → ${formatStatusLabel(notification.statusTo)}`;
      }
      return notification.taskName;
    default:
      return notification.taskName;
  }
}

/** @deprecated Use getNotificationActionText + getNotificationContentText */
export function getNotificationMessage(notification: Notification): string {
  return getNotificationActionText(notification);
}

export function groupNotificationsByDay(
  notifications: Notification[]
): NotificationSection[] {
  const sorted = [...notifications].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const sections: NotificationSection[] = [];

  for (const notification of sorted) {
    const label = getDayLabel(new Date(notification.timestamp));
    const last = sections[sections.length - 1];

    if (last?.title === label) {
      last.data.push(notification);
    } else {
      sections.push({ title: label, data: [notification] });
    }
  }

  return sections;
}

export function getNotificationFilter(
  type: NotificationType
): Exclude<NotificationFilter, "all"> {
  switch (type) {
    case "TASK_ASSIGNED":
    case "TASK_APPROVED":
    case "TASK_REJECTED":
      return "tasks";
    case "COMMENT":
      return "comments";
    case "STATUS_UPDATE":
    case "TASK_REMINDER":
    case "PROJECT_CREATED":
      return "updates";
  }
}

export function filterNotifications(
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] {
  if (filter === "all") return notifications;
  return notifications.filter(
    (n) => getNotificationFilter(n.type) === filter
  );
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getSenderAvatarUrl(sender: string, explicit?: string): string {
  if (explicit) return explicit;
  if (sender === "System") {
    return "https://i.pravatar.cc/100?u=tms-system";
  }
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(sender)}`;
}

export function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
