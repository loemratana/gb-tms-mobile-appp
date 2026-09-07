import { api, type ApiEnvelope } from "@/lib/api";
import type {
  Notification,
  NotificationType as UiType,
} from "@/features/employee/types/notification";

export type NotificationResponse = {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string | null;
  senderAvatarUrl: string | null;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  /** Serialized as "read" by Jackson — `isRead()` bean-getter naming strips the "is". */
  read: boolean;
  readAt: string | null;
  referenceType: string | null;
  referenceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

/**
 * This endpoint serializes Spring Data's native `Page<T>` (page index is
 * `number`, not `page`) — unlike the app's other list endpoints, which use a
 * custom PageResponse wrapper. Only the fields this service actually reads
 * are declared here.
 */
type SpringPageResponse<T> = {
  content: T[];
  totalPages: number;
};

/**
 * TASK_ASSIGNED/TASK_COMMENTED/TASK_UPDATED/TASK_REMINDER/APPROVAL_APPROVED/
 * APPROVAL_REJECTED are produced by the backend today. Everything else
 * (TASK_OVERDUE, USER_MENTIONED, SYSTEM_*) has no producer wired up yet, so
 * it falls back to STATUS_UPDATE — the closest existing icon/theme — rather
 * than being modeled explicitly.
 */
const BACKEND_TO_UI_TYPE: Record<string, UiType> = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_COMMENTED: "COMMENT",
  TASK_UPDATED: "STATUS_UPDATE",
  TASK_REMINDER: "TASK_REMINDER",
  APPROVAL_APPROVED: "TASK_APPROVED",
  APPROVAL_REJECTED: "TASK_REJECTED",
};

function toUiNotification(dto: NotificationResponse): Notification {
  return {
    id: dto.id,
    type: BACKEND_TO_UI_TYPE[dto.type] ?? "STATUS_UPDATE",
    title: dto.title,
    taskId: dto.referenceType === "TASK" ? (dto.referenceId ?? "") : "",
    taskName: dto.message, // backend already composes the full sentence
    sender: dto.senderName ?? "System",
    senderAvatarUrl: dto.senderAvatarUrl ?? undefined,
    timestamp: dto.createdAt,
    isRead: dto.read,
  };
}

export async function fetchNotifications(page = 0): Promise<{
  notifications: Notification[];
  totalPages: number;
}> {
  const { data } = await api.get<ApiEnvelope<SpringPageResponse<NotificationResponse>>>(
    "/notifications",
    { params: { page, size: 20 } }
  );
  return {
    notifications: data.data.content.map(toUiNotification),
    totalPages: data.data.totalPages,
  };
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiEnvelope<{ count: number }>>(
    "/notifications/unread-count"
  );
  return data.data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}
