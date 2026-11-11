import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

type TaskAlarmNativeModule = {
  ring: (title: string, body: string, taskId: string | null) => void;
  stop: () => void;
  isRinging: () => boolean;
  canUseFullScreenIntent: () => boolean;
  openFullScreenIntentSettings: () => void;
};

// Android-only native module (modules/task-alarm/android). Missing on iOS, web,
// Expo Go and builds made before the module existed — every call is then a no-op.
const nativeModule =
  Platform.OS === "android" ? requireOptionalNativeModule<TaskAlarmNativeModule>("TaskAlarm") : null;

/** Full-screen, looping alarm for task reminders (Android). */
export const TaskAlarm = {
  isAvailable: nativeModule !== null,

  /** Starts ringing now: looping alarm sound + vibration + full-screen screen over the lock screen. */
  ring(title: string, body: string, taskId: string | null): void {
    nativeModule?.ring(title, body, taskId);
  },

  stop(): void {
    nativeModule?.stop();
  },

  isRinging(): boolean {
    return nativeModule?.isRinging() ?? false;
  },

  /** False on Android 14+ when the user (or Play) turned off full-screen alarms for this app. */
  canUseFullScreenIntent(): boolean {
    return nativeModule?.canUseFullScreenIntent() ?? false;
  },

  openFullScreenIntentSettings(): void {
    nativeModule?.openFullScreenIntentSettings();
  },
};
