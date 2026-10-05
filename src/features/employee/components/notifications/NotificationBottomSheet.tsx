import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetSectionList,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExpandableSheetBackground,
  ExpandableSheetHandle,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { FilterTabs } from "@/features/employee/components/notifications/FilterTabs";
import { GroupHeader } from "@/features/employee/components/notifications/GroupHeader";
import { NotificationItem } from "@/features/employee/components/notifications/NotificationItem";
import { NotificationListSkeleton } from "@/features/employee/components/notifications/NotificationListSkeleton";
import {
  filterNotifications,
  groupNotificationsByDay,
} from "@/features/employee/helpers/notifications";
import type {
  Notification,
  NotificationFilter,
} from "@/features/employee/types/notification";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { colors } from "@/styles";

export type NotificationBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

function HybridSheetHeader({
  topInset,
  unreadCount,
  onBack,
  onMarkAllRead,
}: {
  topInset: number;
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const { animatedIndex } = useBottomSheet();

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, topInset],
      Extrapolation.CLAMP
    ),
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    width: interpolate(animatedIndex.value, [0, 1], [0, 36], Extrapolation.CLAMP),
    marginRight: interpolate(animatedIndex.value, [0, 1], [0, 10], Extrapolation.CLAMP),
  }));

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0, 0.5], [1, 0], Extrapolation.CLAMP),
    height: interpolate(animatedIndex.value, [0, 0.5], [28, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[containerStyle, { backgroundColor: colors.card }]}>
      <View className="flex-row items-center justify-between px-4 pb-2">
        <View className="flex-1 flex-row items-center">
          <Animated.View style={backStyle}>
            <Pressable
              onPress={onBack}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.card }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          </Animated.View>

          <Text className="text-[18px] font-bold" style={{ color: colors.text }}>
            Notifications
          </Text>
        </View>

        <Pressable
          onPress={onMarkAllRead}
          disabled={unreadCount === 0}
          style={{ opacity: unreadCount > 0 ? 1 : 0.35 }}
        >
          <Text className="text-[13px] font-semibold" style={{ color: colors.brand }}>
            Mark all read
          </Text>
        </Pressable>
      </View>

      <Animated.View style={compactTitleStyle} className="overflow-hidden px-4">
        <Text className="text-[13px]" style={{ color: colors.textMuted }}>
          {unreadCount > 0
            ? `${unreadCount} unread updates`
            : "You're all caught up"}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-20">
      <Ionicons
        name="notifications-off-outline"
        size={32}
        color={colors.textSubtle}
      />
      <Text
        className="mt-3 text-[15px] font-semibold"
        style={{ color: colors.text }}
      >
        No notifications
      </Text>
    </View>
  );
}

export const NotificationBottomSheet = forwardRef<NotificationBottomSheetRef>(
  function NotificationBottomSheet(_, ref) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const sheetIndexRef = useRef(0);
    const [filter, setFilter] = useState<NotificationFilter>("all");

    const snapPoints = useMemo(() => ["55%", "100%"], []);

    const animationConfigs = useBottomSheetSpringConfigs({
      damping: 70,
      stiffness: 400,
      mass: 0.35,
      overshootClamping: true,
    });

    const userRole = useAuthStore((s) => s.user?.role);
    const notifications = useNotificationStore((s) => s.notifications);
    const isLoadingNotifications = useNotificationStore((s) => s.isLoading);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const markAsRead = useNotificationStore((s) => s.markAsRead);
    const toggleRead = useNotificationStore((s) => s.toggleRead);
    const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
    const deleteNotification = useNotificationStore((s) => s.deleteNotification);

    const sections = useMemo(() => {
      const filtered = filterNotifications(notifications, filter);
      return groupNotificationsByDay(filtered);
    }, [notifications, filter]);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useSheetBackdrop();

    const handleSheetChange = useCallback((index: number) => {
      sheetIndexRef.current = index;
    }, []);

    const handleBack = useCallback(() => {
      if (sheetIndexRef.current >= 1) {
        sheetRef.current?.snapToIndex(0, animationConfigs);
        return;
      }
      sheetRef.current?.dismiss();
    }, [animationConfigs]);

    const handlePress = useCallback(
      (notification: Notification) => {
        if (!notification.isRead) {
          markAsRead(notification.id);
        }
        sheetRef.current?.dismiss();

        // Only TASK-referencing notifications carry a taskId today.
        if (!notification.taskId) return;

        if (userRole === "MANAGER") {
          router.push(`/(manager)/tasks/${notification.taskId}`);
        } else {
          router.push(`/(employee)/tasks/${notification.taskId}`);
        }
      },
      [markAsRead, router, userRole]
    );

    const handleLongPress = useCallback(
      (notification: Notification) => {
        Alert.alert(
          notification.isRead ? "Mark as unread?" : "Mark as read?",
          notification.taskName,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: notification.isRead ? "Mark unread" : "Mark read",
              onPress: () => toggleRead(notification.id),
            },
          ]
        );
      },
      [toggleRead]
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        enableContentPanningGesture
        enableHandlePanningGesture
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        backgroundComponent={ExpandableSheetBackground}
        handleComponent={ExpandableSheetHandle}
      >
        <View className="flex-1" style={{ backgroundColor: colors.card }}>
          <HybridSheetHeader
            topInset={insets.top}
            unreadCount={unreadCount}
            onBack={handleBack}
            onMarkAllRead={markAllAsRead}
          />
          <FilterTabs active={filter} onChange={setFilter} />
          {isLoadingNotifications && notifications.length === 0 ? (
            <NotificationListSkeleton />
          ) : (
            <BottomSheetSectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              ListEmptyComponent={<EmptyState />}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              renderSectionHeader={({ section }) => (
                <GroupHeader title={section.title} />
              )}
              renderItem={({ item }) => (
                <NotificationItem
                  notification={item}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                />
              )}
            />
          )}
        </View>
      </BottomSheetModal>
    );
  }
);
