import type {
  Messaging,
  RemoteMessage,
} from "@react-native-firebase/messaging";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";

import {
  registerDevice,
  unregisterDevice,
  type DevicePlatform,
} from "@/services/push.service";
import { useAuthStore } from "@/stores/authStore";
import { getPushToken, setPushToken, clearPushToken } from "@/utils/storage";

/**
 * @react-native-firebase/messaging requires a custom native build — it can never work in
 * Expo Go (no such native module exists there). Everything below no-ops instead of crashing
 * the app when running in Expo Go, so the rest of the app stays testable without a dev-client
 * build. Real push notifications only work in a build produced via `eas build`.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let messagingInstance: Messaging | null = null;

if (!isExpoGo) {
  try {
    // Deferred require: importing this module at all touches the native module, which
    // doesn't exist in Expo Go — so it must only happen once we know we're not in Expo Go.
    const messagingModule = require("@react-native-firebase/messaging");
    messagingInstance = messagingModule.getMessaging();

    // Must run as early as possible, outside the React tree, so background/quit-state pushes
    // are handled even before the JS app has mounted. Runs once on first import of this module.
    messagingModule.setBackgroundMessageHandler(messagingInstance, async () => {
      // The OS already displays the notification and plays the sound for background/quit
      // state — the backend sends a "notification" payload (see FirebaseNotificationSender.java),
      // not a silent data-only message. Nothing to do here beyond acknowledging receipt.
    });
  } catch (error) {
    console.warn("Firebase messaging native module unavailable", error);
    messagingInstance = null;
  }
}

// Foreground presentation for locally-scheduled notifications (see showForegroundNotification
// below) — FCM doesn't auto-display/play sound for foreground messages on Android, and iOS
// behavior isn't guaranteed either, so foreground display is always handled manually. This part
// works fine in Expo Go too (expo-notifications is an Expo SDK module).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Android notification channels are immutable after creation — sound, importance, and
 * vibration can't be changed on an existing channel, only on a new one. Devices that already
 * installed the app before this channel had a `sound` set are stuck silent on "default" forever.
 * Bump this id (e.g. `-v2`, `-v3`) any time the channel's sound/importance/vibration needs to
 * change for existing installs to pick it up.
 */
const ANDROID_NOTIFICATION_CHANNEL_ID = "tms-default-v2";

function currentDevicePlatform(): DevicePlatform | null {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

function navigateToNotificationTarget(message: RemoteMessage): void {
  const referenceType = message.data?.referenceType;
  const referenceId = message.data?.referenceId;
  if (referenceType !== "TASK" || typeof referenceId !== "string" || !referenceId) {
    return;
  }

  const role = useAuthStore.getState().user?.role;
  if (role === "MANAGER") {
    router.push(`/(manager)/tasks/${referenceId}`);
  } else {
    router.push(`/(employee)/tasks/${referenceId}`);
  }
}

async function showForegroundNotification(message: RemoteMessage): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.notification?.title ?? "New notification",
      body: message.notification?.body ?? "",
      sound: true,
      data: message.data ?? {},
    },
    trigger: Platform.OS === "android" ? { channelId: ANDROID_NOTIFICATION_CHANNEL_ID } : null,
  });
}

async function syncDeviceToken(token: string): Promise<void> {
  const platform = currentDevicePlatform();
  if (!platform) return;

  const previous = await getPushToken();
  if (previous === token) return;

  await registerDevice(token, platform);
  await setPushToken(token);
}

let listenersStarted = false;

/** Sets up foreground/tap/token-refresh listeners. Safe to call more than once, and in Expo Go. */
export function startPushListeners(): () => void {
  if (!messagingInstance || listenersStarted) return () => {};
  listenersStarted = true;

  const messagingModule = require("@react-native-firebase/messaging");
  const unsubMessage = messagingModule.onMessage(messagingInstance, (message: RemoteMessage) => {
    void showForegroundNotification(message);
  });

  const unsubOpened = messagingModule.onNotificationOpenedApp(
    messagingInstance,
    (message: RemoteMessage) => {
      navigateToNotificationTarget(message);
    }
  );

  const unsubTokenRefresh = messagingModule.onTokenRefresh(
    messagingInstance,
    (token: string) => {
      void syncDeviceToken(token);
    }
  );

  return () => {
    listenersStarted = false;
    unsubMessage();
    unsubOpened();
    unsubTokenRefresh();
  };
}

/** Handles the case where the app was cold-started by tapping a notification. No-ops in Expo Go. */
export async function consumeInitialNotification(): Promise<void> {
  if (!messagingInstance) return;

  const messagingModule = require("@react-native-firebase/messaging");
  const message = await messagingModule.getInitialNotification(messagingInstance);
  if (message) {
    navigateToNotificationTarget(message);
  }
}

/**
 * Requests permission and registers this device's FCM token with the backend.
 * Safe to call repeatedly (e.g. every sign-in) — only re-registers when the token changed.
 * No-ops in Expo Go or on simulators/emulators, where a real push token isn't available.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (!messagingInstance || !Device.isDevice) {
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  await ensureAndroidChannel();

  try {
    const messagingModule = require("@react-native-firebase/messaging");
    if (Platform.OS === "ios") {
      await messagingModule.registerDeviceForRemoteMessages(messagingInstance);
    }
    const token = await messagingModule.getToken(messagingInstance);
    await syncDeviceToken(token);
  } catch (error) {
    console.warn("Push registration failed", error);
  }
}

/** Unregisters this device's push token from the backend. Call on sign-out. */
export async function unregisterPushNotifications(): Promise<void> {
  const token = await getPushToken();
  if (!token) return;

  try {
    await unregisterDevice(token);
  } catch {
    // Best-effort; an unreachable/stale token gets pruned server-side on the next failed send.
  } finally {
    await clearPushToken();
  }
}
