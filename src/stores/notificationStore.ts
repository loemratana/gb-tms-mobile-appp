import { create } from "zustand";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
} from "@/services/notifications.service";
import type { Notification } from "@/features/employee/types/notification";

function countUnread(notifications: Notification[]): number {
  return notifications.filter((n) => !n.isRead).length;
}

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (input: {
    title: string;
    body: string;
    type?: "PROJECT_CREATED" | "STATUS_UPDATE";
  }) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const { notifications } = await fetchNotifications();
      set({ notifications, unreadCount: countUnread(notifications) });
    } catch {
      // Keep whatever was already loaded — the next poll/fetch retries.
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const count = await fetchUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Silently skip this tick; the next poll retries.
    }
  },

  markAsRead: (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return { notifications, unreadCount: countUnread(notifications) };
    });

    markNotificationAsRead(id).catch(() => {
      // Server never persisted the read state — revert the optimistic update.
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: false } : n
        );
        return { notifications, unreadCount: countUnread(notifications) };
      });
    });
  },

  // No backend endpoint to mark a notification unread — local-only, doesn't persist.
  markAsUnread: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: false } : n
      );
      return { notifications, unreadCount: countUnread(notifications) };
    }),

  toggleRead: (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target) return;
    if (target.isRead) {
      get().markAsUnread(id);
    } else {
      get().markAsRead(id);
    }
  },

  markAllAsRead: () => {
    const unreadIds = get()
      .notifications.filter((n) => !n.isRead)
      .map((n) => n.id);
    if (unreadIds.length === 0) return;

    set((state) => {
      const notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      return { notifications, unreadCount: 0 };
    });

    // No bulk "mark all read" endpoint on the backend — loop individual calls.
    Promise.all(unreadIds.map((id) => markNotificationAsRead(id))).catch(() => {
      // Best-effort; a subsequent fetchAll()/refreshUnreadCount() reconciles any that failed.
    });
  },

  // No backend delete endpoint — local-only, doesn't persist.
  deleteNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return { notifications, unreadCount: countUnread(notifications) };
    }),

  addNotification: (input) =>
    set((state) => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: input.type ?? "PROJECT_CREATED",
        title: input.title,
        taskId: `project-${Date.now()}`,
        taskName: input.body,
        sender: "System",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      const notifications = [notification, ...state.notifications];
      return { notifications, unreadCount: countUnread(notifications) };
    }),

  reset: () => set({ notifications: [], unreadCount: 0, isLoading: false }),
}));
