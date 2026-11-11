import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";

import {
  getNotificationPermissionStatus,
  registerForPushNotifications,
  type NotificationPermissionStatus,
} from "@/lib/pushNotifications";

type NotificationPermission = {
  /** null until the first check finishes. */
  status: NotificationPermissionStatus | null;
  /** Asks for permission the first time; afterwards only the system settings can change it. */
  openSettings: () => Promise<void>;
};

/** The device's notification permission, re-checked whenever the app returns to the foreground. */
export function useNotificationPermission(): NotificationPermission {
  const [status, setStatus] = useState<NotificationPermissionStatus | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await getNotificationPermissionStatus());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const check = () => {
      void getNotificationPermissionStatus().then((next) => {
        if (isMounted) setStatus(next);
      });
    };

    check();
    // The user flips the switch in the system Settings app, then comes back.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const openSettings = useCallback(async () => {
    if (status === "undetermined") {
      // Prompts, then registers this device's push token when allowed.
      await registerForPushNotifications();
      await refresh();
      return;
    }
    await Linking.openSettings();
  }, [status, refresh]);

  return { status, openSettings };
}
