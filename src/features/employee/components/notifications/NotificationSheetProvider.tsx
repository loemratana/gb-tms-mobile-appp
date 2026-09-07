import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

import {
  NotificationBottomSheet,
  type NotificationBottomSheetRef,
} from "@/features/employee/components/notifications/NotificationBottomSheet";
import { useNotificationStore } from "@/stores/notificationStore";

const UNREAD_POLL_INTERVAL_MS = 30_000;

type NotificationSheetContextValue = {
  open: () => void;
  close: () => void;
};

const NotificationSheetContext =
  createContext<NotificationSheetContextValue | null>(null);

export function NotificationSheetProvider({ children }: PropsWithChildren) {
  const sheetRef = useRef<NotificationBottomSheetRef>(null);
  const refreshUnreadCount = useNotificationStore((s) => s.refreshUnreadCount);
  const fetchAll = useNotificationStore((s) => s.fetchAll);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        void refreshUnreadCount();
      }, UNREAD_POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (AppState.currentState === "active") {
      startPolling();
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshUnreadCount();
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [refreshUnreadCount]);

  const open = useCallback(() => {
    sheetRef.current?.present();
    // The list is otherwise only fetched once at login — refresh it here so
    // it can't drift from the polled unread count (badge shows N, sheet is empty).
    void fetchAll();
  }, [fetchAll]);

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  return (
    <NotificationSheetContext.Provider value={{ open, close }}>
      {children}
      <NotificationBottomSheet ref={sheetRef} />
    </NotificationSheetContext.Provider>
  );
}

export function useNotificationSheet() {
  const context = useContext(NotificationSheetContext);
  if (!context) {
    throw new Error(
      "useNotificationSheet must be used within NotificationSheetProvider"
    );
  }
  return context;
}
