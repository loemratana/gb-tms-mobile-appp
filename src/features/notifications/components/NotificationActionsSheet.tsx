import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef, useState, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import {
  getNotificationActionText,
  getNotificationContentText,
} from "@/features/notifications/utils/notification.utils";
import type { Notification } from "@/features/notifications/types/notification.types";
import { colors, palette } from "@/styles";

export type NotificationActionsSheetRef = {
  present: (notification: Notification) => void;
  dismiss: () => void;
};

type NotificationActionsSheetProps = {
  onOpenTask: (notification: Notification) => void;
  onToggleRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
};

type ActionRowProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
};

function ActionRow({ icon, label, onPress, danger = false }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-14 flex-row items-center gap-3.5 px-1 active:bg-field"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-lg ${danger ? "bg-error-subtle" : "bg-subtle"}`}
      >
        <Ionicons name={icon} size={18} color={danger ? palette.red[500] : palette.gray[700]} />
      </View>
      <Text className={`text-body font-medium ${danger ? "text-error" : "text-fg"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Long-press options for a notification: open its task, toggle read state, or delete it. */
export const NotificationActionsSheet = forwardRef<
  NotificationActionsSheetRef,
  NotificationActionsSheetProps
>(function NotificationActionsSheet({ onOpenTask, onToggleRead, onDelete }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const renderBackdrop = useSheetBackdrop();
  const [notification, setNotification] = useState<Notification | null>(null);

  useImperativeHandle(ref, () => ({
    present: (next) => {
      setNotification(next);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const runAndClose = (action: (target: Notification) => void) => {
    if (!notification) return;
    sheetRef.current?.dismiss();
    action(notification);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      // Keep the notification list visible underneath instead of minimising it.
      stackBehavior="push"
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        {notification ? (
          <>
            <View className="border-b border-line-soft pb-3">
              <Text className="text-body font-semibold text-fg" numberOfLines={1}>
                {notification.sender}{" "}
                <Text className="font-normal text-fg-soft">
                  {getNotificationActionText(notification).toLowerCase()}
                </Text>
              </Text>
              <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
                {getNotificationContentText(notification)}
              </Text>
            </View>

            <View className="py-1">
              {notification.taskId ? (
                <ActionRow icon="open-outline" label="Open task" onPress={() => runAndClose(onOpenTask)} />
              ) : null}
              <ActionRow
                icon={notification.isRead ? "mail-unread-outline" : "checkmark-done-outline"}
                label={notification.isRead ? "Mark as unread" : "Mark as read"}
                onPress={() => runAndClose(onToggleRead)}
              />
              <ActionRow
                icon="trash-outline"
                label="Delete notification"
                onPress={() => runAndClose(onDelete)}
                danger
              />
            </View>

            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              accessibilityRole="button"
              className="mt-1 h-12 items-center justify-center rounded-xl bg-subtle active:bg-line"
            >
              <Text className="text-body font-semibold" style={{ color: colors.text }}>
                Cancel
              </Text>
            </Pressable>
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
