import type {
  Messaging,
  RemoteMessage,
} from "@react-native-firebase/messaging";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import type * as ExpoNotifications from "expo-notifications";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";

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

/**
 * Expo SDK 53 removed Android remote-notification support from Expo Go — and unlike the
 * Firebase messaging module, merely *importing* `expo-notifications` throws synchronously
 * in that environment, before any of our own runtime checks get a chance to run. So this
 * module must never statically import it; it has to be deferred via `require()`, exactly
 * like the Firebase messaging module below, and only on the combination that actually
 * breaks (Expo Go + Android). iOS Expo Go and any dev-client build are unaffected.
 */
const skipNotificationsModule = isExpoGo && Platform.OS === "android";

console.log(
  `[PushDebug] module load: isExpoGo=${isExpoGo}, executionEnvironment=${Constants.executionEnvironment}, skipNotificationsModule=${skipNotificationsModule}`
);

let notifications: typeof ExpoNotifications | null = null;

if (!skipNotificationsModule) {
  notifications = require("expo-notifications");
}

let messagingInstance: Messaging | null = null;

if (!isExpoGo) {
  try {
    // Deferred require: importing this module at all touches the native module, which
    // doesn't exist in Expo Go — so it must only happen once we know we're not in Expo Go.
    const messagingModule = require("@react-native-firebase/messaging");
    messagingInstance = messagingModule.getMessaging();
    console.log("[PushDebug] messagingInstance acquired successfully");

    // Must run as early as possible, outside the React tree, so background/quit-state pushes
    // are handled even before the JS app has mounted. Runs once on first import of this module.
    messagingModule.setBackgroundMessageHandler(messagingInstance, async () => {
      // The OS already displays the notification and plays the sound for background/quit
      // state — the backend sends a "notification" payload (see FirebaseNotificationSender.java),
      // not a silent data-only message. Nothing to do here beyond acknowledging receipt.
    });
  } catch (error) {
    console.warn("[PushDebug] Firebase messaging native module unavailable", error);
    messagingInstance = null;
  }
}

// Foreground presentation for locally-scheduled notifications (see showForegroundNotification
// below) — FCM doesn't auto-display/play sound for foreground messages on Android, and iOS
// behavior isn't guaranteed either, so foreground display is always handled manually.
if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Android notification channels are immutable after creation — sound, importance, and
 * vibration can't be changed on an existing channel, only on a new one. Devices that already
 * installed the app before this channel had a `sound` set are stuck silent on "default" forever.
 * Bump this id (e.g. `-v2`, `-v3`) any time the channel's sound/importance/vibration needs to
 * change for existing installs to pick it up.
 */
const ANDROID_NOTIFICATION_CHANNEL_ID = "tms-default-v3";

function currentDevicePlatform(): DevicePlatform | null {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android" || !notifications) return;

  await notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: "Default",
    importance: notifications.AndroidImportance.HIGH,
    // Omitting `sound` (rather than passing the string "default") is what makes the
    // native channel use the system default notification sound — expo-notifications'
    // Android module treats any non-null string here as a custom sound filename to
    // resolve, and "default" isn't a bundled asset, hence the "Custom sound not found" error.
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
  if (!notifications) return;

  await notifications.scheduleNotificationAsync({
    content: {
      title: message.notification?.title ?? "New notification",
      body: message.notification?.body ?? "",
      sound: true,
      data: message.data ?? {},
    },
    trigger: Platform.OS === "android" ? { channelId: ANDROID_NOTIFICATION_CHANNEL_ID } : null,
  });
}

/**
 * DEBUG ONLY: schedules a local notification with fake content, completely bypassing FCM
 * registration/delivery. Use this to isolate whether the problem is "push never arrives"
 * (registration/backend/FCM) vs. "push arrives but nothing shows" (permission/channel/display) —
 * if this doesn't show up with sound, the bug is in the local display path below, not in FCM.
 */
export async function sendMockPushNotification(): Promise<void> {
  if (!notifications) {
    Alert.alert(
      "Not supported in Expo Go",
      "Android notifications require a dev-client build since Expo SDK 53 removed this from Expo Go. Run the app from your development build instead."
    );
    return;
  }

  await ensureAndroidChannel();
  await notifications.scheduleNotificationAsync({
    content: {
      title: "Test notification",
      body: "This is mock data — if you see and hear this, local display works fine.",
      sound: true,
      data: { mock: true },
    },
    trigger: Platform.OS === "android" ? { channelId: ANDROID_NOTIFICATION_CHANNEL_ID } : null,
  });
}

/**
 * DEBUG ONLY: fetches the raw FCM token and shows it, bypassing permission checks, the
 * Android channel setup, and the backend registration call. Use this to isolate whether
 * `getToken()` itself works on this device — if this hangs or throws, the problem is
 * Firebase/Google Play Services, not our registration or backend code.
 */
export async function debugGetFcmToken(): Promise<void> {
  if (!messagingInstance) {
    Alert.alert("FCM debug", "messagingInstance is null (Expo Go, or native Firebase module unavailable on this build).");
    return;
  }

  try {
    const messagingModule = require("@react-native-firebase/messaging");
    console.log("[PushDebug] debugGetFcmToken: requesting token directly...");
    const token = await messagingModule.getToken(messagingInstance);
    console.log(`[PushDebug] debugGetFcmToken: got token: ${token}`);
    Alert.alert("FCM token", token);
  } catch (error) {
    console.warn("[PushDebug] debugGetFcmToken failed", error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    Alert.alert("FCM debug: getToken failed", message);
  }
}

async function syncDeviceToken(token: string): Promise<void> {
  const platform = currentDevicePlatform();
  if (!platform) return;

  const previous = await getPushToken();
  if (previous === token) {
    console.log("[PushDebug] syncDeviceToken: token unchanged from cached value, skipping backend call");
    return;
  }

  console.log(`[PushDebug] syncDeviceToken: calling registerDevice API (platform=${platform})`);
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
  // TEMPORARY diagnostics: console.log (readable via the Metro terminal) plus __DEV__-only
  // Alert popups at every decision point. Remove once push registration is confirmed working
  // end-to-end.
  console.log("[PushDebug] registerForPushNotifications() called");

  if (!messagingInstance) {
    console.log("[PushDebug] bail: messagingInstance is null (Expo Go, or native Firebase module unavailable on this build)");
    if (__DEV__) Alert.alert("Push debug", "messagingInstance is null (Expo Go, or native Firebase module unavailable on this build).");
    return;
  }
  if (!Device.isDevice) {
    console.log("[PushDebug] bail: Device.isDevice is false (simulator/emulator)");
    if (__DEV__) Alert.alert("Push debug", "Device.isDevice is false (simulator/emulator).");
    return;
  }
  if (!notifications) {
    console.log("[PushDebug] bail: notifications module unavailable (Expo Go on Android)");
    if (__DEV__) Alert.alert("Push debug", "notifications module unavailable (Expo Go on Android).");
    return;
  }

  const { status } = await notifications.requestPermissionsAsync();
  console.log(`[PushDebug] permission status="${status}"`);
  if (status !== "granted") {
    if (__DEV__) Alert.alert("Push debug", `Permission not granted: status="${status}"`);
    return;
  }

  await ensureAndroidChannel();
  console.log("[PushDebug] android channel ensured, requesting FCM token...");

  try {
    const messagingModule = require("@react-native-firebase/messaging");
    if (Platform.OS === "ios") {
      await messagingModule.registerDeviceForRemoteMessages(messagingInstance);
    }
    const token = await messagingModule.getToken(messagingInstance);
    console.log(`[PushDebug] got FCM token: ${token.slice(0, 24)}...`);
    if (__DEV__) Alert.alert("Push debug", `Got FCM token, registering with backend:\n${token.slice(0, 24)}...`);
    await syncDeviceToken(token);
    console.log("[PushDebug] registered with backend successfully");
    if (__DEV__) Alert.alert("Push debug", "Registered with backend successfully.");
  } catch (error) {
    console.warn("[PushDebug] Push registration failed", error);
    if (__DEV__) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Push debug: registration failed", message);
    }
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
