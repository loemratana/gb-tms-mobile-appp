import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetSectionList,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
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
} from "@/components/ui/BottomSheet";
import { getMeetingDetailPathForRole, getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { FilterTabs } from "./FilterTabs";
import {
  NotificationActionsSheet,
  type NotificationActionsSheetRef,
} from "./NotificationActionsSheet";
import { GroupHeader } from "./GroupHeader";
import { NotificationItem } from "./NotificationItem";
import { NotificationListSkeleton } from "./NotificationListSkeleton";
import {
  filterNotifications,
  groupNotificationsByDay,
} from "@/features/notifications/utils/notification.utils";
import type {
  Notification,
  NotificationFilter,
} from "@/features/notifications/types/notification.types";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { colors, palette } from "@/styles";

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
      <View className="flex-row items-center justify-between px-5 pb-1">
        <View className="flex-1 flex-row items-center">
          <Animated.View style={backStyle}>
            <Pressable
              onPress={onBack}
              className="h-9 w-9 items-center justify-center rounded-full bg-subtle"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
          </Animated.View>

          <Text className="text-[20px] font-bold tracking-tight text-fg">Notifications</Text>
          {unreadCount > 0 ? (
            <View className="ml-2 min-w-[22px] items-center rounded-full bg-brand px-1.5 py-0.5">
              <Text className="text-micro font-bold text-white">{unreadCount}</Text>
            </View>
          ) : null}
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={onMarkAllRead}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            className="flex-row items-center gap-1 rounded-lg px-2 py-1.5 active:bg-subtle"
          >
            <Ionicons name="checkmark-done" size={16} color={palette.green[600]} />
            <Text className="text-caption font-semibold text-brand-strong">Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <Animated.View style={compactTitleStyle} className="overflow-hidden px-5">
        <Text className="text-caption text-fg-soft">
          {unreadCount > 0
            ? `${unreadCount} unread · hold a notification for options`
            : "You're all caught up"}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <View className="items-center px-10 py-20">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-subtle">
        <Ionicons name="notifications-off-outline" size={26} color={palette.gray[400]} />
      </View>
      <Text className="mt-4 text-headline font-semibold text-fg">
        {isFiltered ? "Nothing here" : "No notifications yet"}
      </Text>
      <Text className="mt-1 text-center text-caption leading-5 text-fg-soft">
        {isFiltered
          ? "No notifications match this filter."
          : "Task updates, comments and reminders will show up here."}
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
    const actionsSheetRef = useRef<NotificationActionsSheetRef>(null);

    const sections = useMemo(() => {
      const filtered = filterNotifications(notifications, filter);
      return groupNotificationsByDay(filtered);
    }, [notifications, filter]);

    const unreadCountsByFilter = useMemo(() => {
      const unread = notifications.filter((notification) => !notification.isRead);
      return {
        all: unread.length,
        tasks: filterNotifications(unread, "tasks").length,
        comments: filterNotifications(unread, "comments").length,
        updates: filterNotifications(unread, "updates").length,
      };
    }, [notifications]);

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

        if (!userRole) return;
        if (notification.meetingId) {
          router.push(getMeetingDetailPathForRole(userRole, notification.meetingId));
          return;
        }
        // Otherwise only TASK-referencing notifications carry a target.
        if (!notification.taskId) return;

        router.push(getTaskDetailPathForRole(userRole, notification.taskId));
      },
      [markAsRead, router, userRole]
    );

    const handleLongPress = useCallback((notification: Notification) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      actionsSheetRef.current?.present(notification);
    }, []);

    const handleToggleRead = useCallback(
      (notification: Notification) => toggleRead(notification.id),
      [toggleRead]
    );

    const handleDelete = useCallback(
      (notification: Notification) => deleteNotification(notification.id),
      [deleteNotification]
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        // Dynamic sizing (on by default in v5) adds a content-height snap point, so the sheet
        // jumped whenever marking read changed the header/badges height.
        enableDynamicSizing={false}
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
          <FilterTabs active={filter} onChange={setFilter} counts={unreadCountsByFilter} />
          {isLoadingNotifications && notifications.length === 0 ? (
            <NotificationListSkeleton />
          ) : (
            <BottomSheetSectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              ListEmptyComponent={<EmptyState isFiltered={filter !== "all"} />}
              style={{ flex: 1 }}
              contentContainerStyle={{
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

        <NotificationActionsSheet
          ref={actionsSheetRef}
          onOpenTask={handlePress}
          onToggleRead={handleToggleRead}
          onDelete={handleDelete}
        />
      </BottomSheetModal>
    );
  }
);
