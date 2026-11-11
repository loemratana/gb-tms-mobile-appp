import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { ScrollView, View } from "react-native";

import { StackHeader } from "@/components/layout/StackHeader";
import {
  ChangePasswordBottomSheet,
  type ChangePasswordBottomSheetRef,
} from "@/features/profile/components/ChangePasswordBottomSheet";
import {
  EditProfileBottomSheet,
  type EditProfileBottomSheetRef,
} from "@/features/profile/components/EditProfileBottomSheet";
import { SettingsGroup, SettingsRow } from "@/features/profile/components/SettingsList";
import { useNotificationPermission } from "@/features/profile/hooks/useNotificationPermission";
import { useSignOutConfirmation } from "@/features/profile/hooks/useSignOutConfirmation";
import type { NotificationPermissionStatus } from "@/lib/pushNotifications";
import { debugGetFcmToken, sendMockPushNotification, sendMockReminderNotification } from "@/lib/pushNotifications";

const APP_VERSION = Constants.expoConfig?.version ?? "—";

const PERMISSION_LABEL: Record<NotificationPermissionStatus, { value: string; tone: "success" | "warning" | "default"; hint: string }> = {
  granted: { value: "On", tone: "success", hint: "Opens system settings" },
  denied: { value: "Off", tone: "warning", hint: "Opens system settings to turn notifications on" },
  undetermined: { value: "Not set", tone: "default", hint: "Asks for notification permission" },
  unavailable: { value: "Unavailable", tone: "default", hint: "Not supported in this build" },
};

/** Account, notification, reminder and app settings. Only settings that actually do something are listed. */
export default function SettingsScreen() {
  const router = useRouter();
  const editSheetRef = useRef<EditProfileBottomSheetRef>(null);
  const passwordSheetRef = useRef<ChangePasswordBottomSheetRef>(null);
  const notificationPermission = useNotificationPermission();
  const confirmSignOut = useSignOutConfirmation();

  const permission = notificationPermission.status ? PERMISSION_LABEL[notificationPermission.status] : null;
  const canOpenNotificationSettings = notificationPermission.status !== null && notificationPermission.status !== "unavailable";

  return (
    <View className="flex-1 bg-screen">
      <StackHeader title="Settings" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 20, paddingBottom: 40, gap: 24 }} showsVerticalScrollIndicator={false}>
        <SettingsGroup title="Account">
          <SettingsRow icon="person-outline" label="Edit profile" description="Name, email, phone and photo" onPress={() => editSheetRef.current?.present()} />
          <SettingsRow icon="lock-closed-outline" label="Change password" onPress={() => passwordSheetRef.current?.present()} />
        </SettingsGroup>

        <SettingsGroup
          title="Notifications"
          footer="Task assignments, reviews and reminders are sent as push notifications."
        >
          <SettingsRow
            icon="notifications-outline"
            label="Push notifications"
            value={permission?.value ?? "Checking…"}
            valueTone={permission?.tone ?? "default"}
            accessibilityHint={permission?.hint}
            onPress={canOpenNotificationSettings ? () => void notificationPermission.openSettings() : undefined}
          />
        </SettingsGroup>

        <SettingsGroup title="Task reminders">
          <SettingsRow
            icon="alarm-outline"
            label="Reminders are set per task"
            description="Open a task and tap the alarm icon to choose when you're reminded. Reminders need push notifications on."
          />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsRow
            icon="phone-portrait-outline"
            label="Sign out of all devices"
            isDestructive
            onPress={() => confirmSignOut({ allDevices: true })}
          />
        </SettingsGroup>

        <SettingsGroup title="About">
          <SettingsRow icon="information-circle-outline" label="Version" value={APP_VERSION} />
        </SettingsGroup>

        {__DEV__ ? (
          <SettingsGroup title="Developer" footer="Only visible in development builds.">
            <SettingsRow icon="paper-plane-outline" label="Send test notification" onPress={() => void sendMockPushNotification()} />
            <SettingsRow icon="alarm-outline" label="Test reminder alarm (in 5s)" onPress={() => void sendMockReminderNotification()} />
            <SettingsRow icon="key-outline" label="Show FCM token" onPress={() => void debugGetFcmToken()} />
          </SettingsGroup>
        ) : null}
      </ScrollView>

      <EditProfileBottomSheet ref={editSheetRef} />
      <ChangePasswordBottomSheet ref={passwordSheetRef} />
    </View>
  );
}
