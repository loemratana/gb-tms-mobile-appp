import Ionicons from "@expo/vector-icons/Ionicons";
import { Bell, CheckCircle2, MessageSquare, RefreshCw, XCircle } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

import {
  formatNotificationTime,
  getNotificationActionText,
  getNotificationContentText,
  getSenderAvatarUrl,
} from "@/features/employee/helpers/notifications";
import type { Notification, NotificationType } from "@/features/employee/types/notification";
import { colors, palette } from "@/styles";

const TYPE_THEME: Record<NotificationType, { accent: string }> = {
  TASK_ASSIGNED: { accent: colors.success },
  TASK_APPROVED: { accent: colors.success },
  TASK_REJECTED: { accent: colors.danger },
  COMMENT: { accent: palette.blue[500] },
  STATUS_UPDATE: { accent: palette.violet[500] },
  TASK_REMINDER: { accent: colors.warning },
  PROJECT_CREATED: { accent: colors.brand },
};

/** Small white glyph shown on the avatar's type badge — sized/colored by the caller. */
function TypeGlyph({ type, size, color }: { type: NotificationType; size: number; color: string }) {
  switch (type) {
    case "TASK_ASSIGNED":
    case "TASK_APPROVED":
      return <CheckCircle2 size={size} color={color} strokeWidth={2.4} />;
    case "TASK_REJECTED":
      return <XCircle size={size} color={color} strokeWidth={2.4} />;
    case "COMMENT":
      return <MessageSquare size={size} color={color} strokeWidth={2.4} />;
    case "PROJECT_CREATED":
      return <CheckCircle2 size={size} color={color} strokeWidth={2.4} />;
    case "TASK_REMINDER":
      return <Bell size={size} color={color} strokeWidth={2.4} />;
    default:
      return <RefreshCw size={size} color={color} strokeWidth={2.4} />;
  }
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
  const theme = TYPE_THEME[notification.type];

  return (
    <Pressable
      onPress={() => onPress(notification)}
      onLongPress={() => onLongPress(notification)}
      delayLongPress={400}
      accessibilityRole="button"
      className="flex-row items-center gap-3 border-b py-4"
      style={{ borderColor: colors.border }}
    >
      {/* Left column: sender avatar, with the notification type as a corner badge. */}
      <View className="relative">
        <Image
          source={{ uri: avatarUrl }}
          className="h-16 w-16 rounded-full"
          style={{ backgroundColor: colors.border }}
        />
        <View
          className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2"
          style={{ backgroundColor: theme.accent, borderColor: colors.card }}
        >
          <TypeGlyph type={notification.type} size={13} color={colors.textInverse} />
        </View>
      </View>

      {/* Right column: sender, message, timestamp. */}
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="flex-1 text-[14px] font-bold"
            style={{ color: colors.text }}
          >
            {notification.sender}
          </Text>
          {!notification.isRead ? (
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.brand }}
            />
          ) : null}
        </View>

        <Text
          className="mt-1 text-[13px] font-medium"
          style={{ color: colors.textSecondary }}
        >
          {actionText}
        </Text>

        <Text
          numberOfLines={2}
          className="mt-1 text-[13px] leading-5"
          style={{ color: colors.textMuted }}
        >
          {contentText}
        </Text>

        <View className="mt-2 flex-row items-center gap-1">
          <Ionicons name="time-outline" size={12} color={colors.textSubtle} />
          <Text className="text-[11px]" style={{ color: colors.textSubtle }}>
            {formatNotificationTime(notification.timestamp)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
