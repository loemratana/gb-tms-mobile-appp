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
import { queryClient } from "@/config/query.config";
import { getMeetingDetailPathForRole, getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { meetingKeys } from "@/features/meetings/hooks/useMeetings";
import { taskKeys } from "@/features/tasks/hooks/useTasks";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { TaskAlarm } from "@modules/task-alarm";
import { getPushToken, setPushToken, clearPushToken } from "./storage";

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

/** Push diagnostics: development builds only, so release logs never carry tokens or noise. */
function debugLog(...args: unknown[]): void {
  if (__DEV__) console.log(...args);
}

debugLog(
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
    debugLog("[PushDebug] messagingInstance acquired successfully");

    // Must run as early as possible, outside the React tree, so background/quit-state pushes
    // are handled even before the JS app has mounted. Runs once on first import of this module.
    messagingModule.setBackgroundMessageHandler(messagingInstance, async (message: RemoteMessage) => {
      // Ordinary pushes carry a "notification" payload, so the OS shows them itself.
      // Task reminders arrive data-only on Android (FirebaseNotificationSender.java) so
      // they can ring the full-screen alarm instead of a plain notification.
      ringReminderAlarm(message);
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

/**
 * Task reminders get their own channel with an alarm-clock sound, max importance and
 * a long vibration, so they stand out from ordinary notifications. The backend sends
 * TASK_REMINDER pushes to this same channel id (FirebaseNotificationSender) — keep the
 * two in sync, and bump the suffix here and there if the sound or vibration changes.
 */
export const ANDROID_REMINDER_CHANNEL_ID = "task-reminders-v1";
/** Bundled via the expo-notifications plugin in app.json (assets/sounds/alarm.wav). */
const REMINDER_SOUND = "alarm.wav";
/**
 * Expo Go can't bundle our sounds (alarm.wav only ships in dev/production builds),
 * so asking for it there just logs "Custom sound not found". Use the default sound
 * in Expo Go; real builds get the alarm.
 */
const REMINDER_NOTIFICATION_SOUND: string | boolean = isExpoGo ? true : REMINDER_SOUND;
const REMINDER_NOTIFICATION_TYPE = "TASK_REMINDER";

function isReminder(message: RemoteMessage): boolean {
  return message.data?.type === REMINDER_NOTIFICATION_TYPE;
}

function dataString(message: RemoteMessage, key: string): string | undefined {
  const value = message.data?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Rings the full-screen, looping task alarm for a reminder push (Android with the
 * TaskAlarm module). Returns false when it didn't — not a reminder, iOS, or an older
 * build without the module — so the caller can fall back to a normal notification.
 */
function ringReminderAlarm(message: RemoteMessage): boolean {
  if (!isReminder(message) || !TaskAlarm.isAvailable) return false;

  TaskAlarm.ring(
    dataString(message, "title") ?? message.notification?.title ?? "Task reminder",
    dataString(message, "body") ?? message.notification?.body ?? "",
    dataString(message, "referenceId") ?? null,
  );
  return true;
}

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

  await notifications.setNotificationChannelAsync(ANDROID_REMINDER_CHANNEL_ID, {
    name: "Task reminders",
    description: "Alarm sound when a task reminder is due",
    importance: notifications.AndroidImportance.MAX,
    sound: REMINDER_SOUND,
    vibrationPattern: [0, 600, 300, 600, 300, 600],
    enableVibrate: true,
    lockscreenVisibility: notifications.AndroidNotificationVisibility.PUBLIC,
    // Play through the alarm stream so it follows the alarm volume, not the ringer.
    audioAttributes: {
      usage: notifications.AndroidAudioUsage.ALARM,
      contentType: notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

function navigateToNotificationTarget(message: RemoteMessage): void {
  const referenceType = message.data?.referenceType;
  const referenceId = message.data?.referenceId;
  if (typeof referenceId !== "string" || !referenceId) return;

  const role = useAuthStore.getState().user?.role;
  if (!role) return;
  if (referenceType === "TASK") {
    router.push(getTaskDetailPathForRole(role, referenceId));
  } else if (referenceType === "MEETING_BOOKING") {
    router.push(getMeetingDetailPathForRole(role, referenceId));
  }
}

/**
 * A push means something changed on the server (task assigned, status changed,
 * comment…). Refresh task data and the notification list right away instead of
 * waiting for the next poll or a manual refresh.
 */
function refreshAfterPush(): void {
  void queryClient.invalidateQueries({ queryKey: taskKeys.all });
  void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
  void useNotificationStore.getState().fetchAll();
}

async function showForegroundNotification(message: RemoteMessage): Promise<void> {
  if (!notifications) return;
  const reminder = isReminder(message);

  await notifications.scheduleNotificationAsync({
    content: {
      title: message.notification?.title ?? "New notification",
      body: message.notification?.body ?? "",
      sound: reminder ? REMINDER_NOTIFICATION_SOUND : true,
      ...(reminder ? { interruptionLevel: "timeSensitive" as const } : {}),
      data: message.data ?? {},
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: reminder ? ANDROID_REMINDER_CHANNEL_ID : ANDROID_NOTIFICATION_CHANNEL_ID }
        : null,
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
 * DEBUG ONLY: shows a local notification exactly like a TASK_REMINDER push, 5 seconds
 * from now — lock the phone or background the app to hear the alarm as users will.
 */
export async function sendMockReminderNotification(): Promise<void> {
  if (TaskAlarm.isAvailable) {
    if (!TaskAlarm.canUseFullScreenIntent()) {
      Alert.alert(
        "Allow full-screen alarms",
        "Turn on full-screen notifications for this app so reminders can show over the lock screen.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Open settings", onPress: () => TaskAlarm.openFullScreenIntentSettings() },
        ],
      );
    }
    // Lock the phone within 5 seconds to see it over the lock screen.
    setTimeout(() => {
      TaskAlarm.ring("Task reminder", "Test alarm — this is how a due reminder will ring.", null);
    }, 5_000);
    return;
  }

  if (!notifications) {
    Alert.alert("Not supported in Expo Go", "Reminder sounds need a development build.");
    return;
  }

  await ensureAndroidChannel();
  await notifications.scheduleNotificationAsync({
    content: {
      title: "Task reminder",
      body: "Test alarm — this is how a due reminder will sound.",
      sound: REMINDER_NOTIFICATION_SOUND,
      interruptionLevel: "timeSensitive",
      data: { mock: true, type: REMINDER_NOTIFICATION_TYPE },
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      ...(Platform.OS === "android" ? { channelId: ANDROID_REMINDER_CHANNEL_ID } : {}),
    },
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
    debugLog("[PushDebug] debugGetFcmToken: requesting token directly...");
    const token = await messagingModule.getToken(messagingInstance);
    debugLog(`[PushDebug] debugGetFcmToken: got token: ${token}`);
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
    debugLog("[PushDebug] syncDeviceToken: token unchanged from cached value, skipping backend call");
    return;
  }

  debugLog(`[PushDebug] syncDeviceToken: calling registerDevice API (platform=${platform})`);
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
    refreshAfterPush();
    if (ringReminderAlarm(message)) return;
    void showForegroundNotification(message);
  });

  const unsubOpened = messagingModule.onNotificationOpenedApp(
    messagingInstance,
    (message: RemoteMessage) => {
      refreshAfterPush();
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
  if (!messagingInstance || !Device.isDevice || !notifications) return;

  const { status } = await notifications.requestPermissionsAsync();
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

/**
 * Stops this device receiving the signed-out user's pushes. Call on sign-out.
 *
 * `localOnly` skips the backend call — used when the session already died (refresh failed),
 * where an authenticated request would only 401 again. Deleting the FCM token on the device
 * covers that case: the backend's registration becomes invalid and is pruned on the next send.
 */
export async function unregisterPushNotifications(options?: { localOnly?: boolean }): Promise<void> {
  const token = await getPushToken();

  try {
    if (token && !options?.localOnly) {
      await unregisterDevice(token);
    }
  } catch {
    // Best-effort; the local token deletion below still stops delivery.
  } finally {
    await deleteDeviceFcmToken();
    await clearPushToken();
  }
}

async function deleteDeviceFcmToken(): Promise<void> {
  if (!messagingInstance) return;
  try {
    const messagingModule = require("@react-native-firebase/messaging");
    await messagingModule.deleteToken(messagingInstance);
  } catch (error) {
    console.warn("Deleting FCM token failed", error);
  }
}

/** "unavailable": this build can't show notifications at all (Expo Go on Android). */
export type NotificationPermissionStatus = "granted" | "denied" | "undetermined" | "unavailable";

/** The OS notification permission, for the Settings screen. Never prompts. */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!notifications) return "unavailable";
  const { status } = await notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}
