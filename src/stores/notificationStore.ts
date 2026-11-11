import { create } from "zustand";

import {
  deleteNotification as deleteNotificationApi,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "@/services/notifications.service";
import type { Notification } from "@/features/notifications/types/notification.types";

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
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => {
  /** Optimistically sets one notification's read flag; returns a function that undoes it. */
  const setReadFlag = (id: string, isRead: boolean) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead } : n
      );
      return { notifications, unreadCount: countUnread(notifications) };
    });
    return () => setReadFlag(id, !isRead);
  };

  return {
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

      const undo = setReadFlag(id, true);
      // Server never persisted the read state — revert the optimistic update.
      markNotificationAsRead(id).catch(undo);
    },

    markAsUnread: (id) => {
      const target = get().notifications.find((n) => n.id === id);
      if (!target || !target.isRead) return;

      const undo = setReadFlag(id, false);
      markNotificationAsUnread(id).catch(undo);
    },

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
      if (!get().notifications.some((n) => !n.isRead)) return;

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      markAllNotificationsAsRead().catch(() => {
        // Reload the true state rather than guessing which ones the server updated.
        void get().fetchAll();
      });
    },

    deleteNotification: (id) => {
      const previous = get().notifications;
      const index = previous.findIndex((n) => n.id === id);
      if (index === -1) return;

      set(() => {
        const notifications = previous.filter((n) => n.id !== id);
        return { notifications, unreadCount: countUnread(notifications) };
      });

      deleteNotificationApi(id).catch(() => {
        // Put it back where it was if the server kept it.
        set((state) => {
          if (state.notifications.some((n) => n.id === id)) return state;
          const notifications = [...state.notifications];
          notifications.splice(Math.min(index, notifications.length), 0, previous[index]);
          return { notifications, unreadCount: countUnread(notifications) };
        });
      });
    },

    reset: () => set({ notifications: [], unreadCount: 0, isLoading: false }),
  };
});
