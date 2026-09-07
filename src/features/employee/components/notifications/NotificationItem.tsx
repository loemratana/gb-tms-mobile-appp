import Ionicons from "@expo/vector-icons/Ionicons";
import { Bell, CheckCircle2, MessageSquare, RefreshCw, XCircle } from "lucide-react-native";
import { Image, Platform, Pressable, Text, View } from "react-native";

import {
  formatNotificationTime,
  getNotificationActionText,
  getNotificationContentText,
  getSenderAvatarUrl,
} from "@/features/employee/helpers/notifications";
import type { Notification, NotificationType } from "@/features/employee/types/notification";

const TYPE_THEME: Record<
  NotificationType,
  { accent: string; iconBg: string }
> = {
  TASK_ASSIGNED: { accent: "#22C55E", iconBg: "#ECFDF5" },
  TASK_APPROVED: { accent: "#22C55E", iconBg: "#ECFDF5" },
  TASK_REJECTED: { accent: "#EF4444", iconBg: "#FEF2F2" },
  COMMENT: { accent: "#3B82F6", iconBg: "#EFF6FF" },
  STATUS_UPDATE: { accent: "#8B5CF6", iconBg: "#F5F3FF" },
  TASK_REMINDER: { accent: "#F59E0B", iconBg: "#FFFBEB" },
  PROJECT_CREATED: { accent: "#32CD32", iconBg: "#ECFDF5" },
};

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
});

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const theme = TYPE_THEME[type];
  const size = 18;

  const icon =
    type === "TASK_ASSIGNED" || type === "TASK_APPROVED" ? (
      <CheckCircle2 size={size} color={theme.accent} strokeWidth={2.2} />
    ) : type === "TASK_REJECTED" ? (
      <XCircle size={size} color={theme.accent} strokeWidth={2.2} />
    ) : type === "COMMENT" ? (
      <MessageSquare size={size} color={theme.accent} strokeWidth={2.2} />
    ) : type === "PROJECT_CREATED" ? (
      <CheckCircle2 size={size} color={theme.accent} strokeWidth={2.2} />
    ) : type === "TASK_REMINDER" ? (
      <Bell size={size} color={theme.accent} strokeWidth={2.2} />
    ) : (
      <RefreshCw size={size} color={theme.accent} strokeWidth={2.2} />
    );

  return (
    <View
      className="h-10 w-10 items-center justify-center rounded-xl"
      style={{ backgroundColor: theme.iconBg }}
    >
      {icon}
    </View>
  );
}

type NotificationItemProps = {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onLongPress: (notification: Notification) => void;
};

export function NotificationItem({
  notification,
  onPress,
  onLongPress,
}: NotificationItemProps) {
  const actionText = getNotificationActionText(notification);
  const contentText = getNotificationContentText(notification);
  const avatarUrl = getSenderAvatarUrl(
    notification.sender,
    notification.senderAvatarUrl
  );

  return (
    <Pressable
      onPress={() => onPress(notification)}
      onLongPress={() => onLongPress(notification)}
      delayLongPress={400}
      accessibilityRole="button"
      className="mb-3 rounded-2xl bg-white p-4"
      style={[
        CARD_SHADOW,
        { opacity: notification.isRead ? 0.88 : 1 },
      ]}
    >
      <View className="flex-row gap-3">
        <NotificationTypeIcon type={notification.type} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: avatarUrl }}
              className="h-8 w-8 rounded-full bg-[#E5E7EB]"
            />
            <Text
              numberOfLines={1}
              className="flex-1 text-[14px] font-bold text-[#111827]"
            >
              {notification.sender}
            </Text>
            {!notification.isRead ? (
              <View className="h-2 w-2 rounded-full bg-[#32CD32]" />
            ) : null}
          </View>

          <Text className="mt-1 text-[13px] font-medium text-[#374151]">
            {actionText}
          </Text>

          <Text
            numberOfLines={2}
            className="mt-1 text-[13px] leading-5 text-[#6B7280]"
          >
            {contentText}
          </Text>

          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text className="text-[11px] text-[#9CA3AF]">
              {formatNotificationTime(notification.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
