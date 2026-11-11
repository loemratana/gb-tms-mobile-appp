import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import {
  formatNotificationTime,
  getNotificationActionText,
  getNotificationContentText,
  getSenderAvatarUrl,
} from "@/features/notifications/utils/notification.utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Notification, NotificationType } from "@/features/notifications/types/notification.types";
import { colors, palette, withAlpha } from "@/styles";

const AVATAR_SIZE = 44 as const;

const TYPE_ACCENT: Record<NotificationType, string> = {
  TASK_ASSIGNED: colors.brand,
  TASK_APPROVED: colors.brand,
  TASK_REJECTED: colors.danger,
  COMMENT: palette.blue[500],
  STATUS_UPDATE: palette.violet[500],
  TASK_REMINDER: colors.warning,
  MEETING: colors.success,
};

/** Small white glyph shown on the avatar's type badge. */
function TypeGlyph({ type }: { type: NotificationType }) {
  const props = { size: 11, color: colors.textInverse };
  switch (type) {
    case "TASK_ASSIGNED":
    case "TASK_APPROVED":
      return <Ionicons name="checkmark-circle-outline" {...props} />;
    case "TASK_REJECTED":
      return <Ionicons name="close-circle" {...props} />;
    case "COMMENT":
      return <Ionicons name="chatbubble" {...props} />;
    case "TASK_REMINDER":
      return <Ionicons name="notifications" {...props} />;
    case "MEETING":
      return <Ionicons name="calendar" {...props} />;
    default:
      return <Ionicons name="refresh" {...props} />;
  }
}

type NotificationItemProps = {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onLongPress: (notification: Notification) => void;
};

/** One notification row: avatar with type badge, "Sender action", preview text and time. */
export function NotificationItem({ notification, onPress, onLongPress }: NotificationItemProps) {
  const actionText = getNotificationActionText(notification);
  const contentText = getNotificationContentText(notification);
  const avatarUrl = getSenderAvatarUrl(notification.senderAvatarUrl);
  const accent = TYPE_ACCENT[notification.type];
  const isUnread = !notification.isRead;

  return (
    <Pressable
      onPress={() => onPress(notification)}
      onLongPress={() => onLongPress(notification)}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? "Unread. " : ""}${notification.sender} ${actionText}. ${contentText}`}
      accessibilityHint="Opens the task. Long press for more options."
      className="flex-row gap-3 px-5 py-3.5 active:bg-subtle"
      style={{ backgroundColor: isUnread ? withAlpha(colors.brand, 0.06) : colors.card }}
    >
      <View>
        <Avatar name={notification.sender} imageUrl={avatarUrl} size={AVATAR_SIZE} />
        <View
          className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-surface"
          style={{ backgroundColor: accent }}
        >
          <TypeGlyph type={notification.type} />
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start gap-2">
          <Text className="flex-1 text-body-sm leading-5 text-fg-sub" numberOfLines={2}>
            <Text className="font-semibold text-fg">{notification.sender}</Text>{" "}
            {actionText.charAt(0).toLowerCase() + actionText.slice(1)}
          </Text>
          <Text className="mt-0.5 text-micro text-fg-faint">
            {formatNotificationTime(notification.timestamp)}
          </Text>
        </View>

        <Text className="mt-0.5 text-caption leading-[18px] text-fg-soft" numberOfLines={2}>
          {contentText}
        </Text>
      </View>

      <View className="w-2 items-center pt-1.5">
        {isUnread ? (
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.brand }} />
        ) : null}
      </View>
    </Pressable>
  );
}
