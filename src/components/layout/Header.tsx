import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { useNotificationStore } from "@/stores/notificationStore";
import { colors } from "@/styles";

type HeaderProfileProps = {
  userName: string;
  avatarUrl: string | null;
  role?: string;
  onPress?: () => void;
};


function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Left side of the native Stack header bar. */
export function HeaderProfile({
  userName,
  avatarUrl,
  role,
  onPress,
}: HeaderProfileProps) {
  const greeting = getGreeting();

  const rotateAnimRef = useRef<Animated.Value | null>(null);
  if (rotateAnimRef.current === null) {
    rotateAnimRef.current = new Animated.Value(0);
  }
  // Lazy ref initialization (react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents):
  // reading .current here is safe since it's only ever set once, above.
  // eslint-disable-next-line react-hooks/refs
  const rotateAnim = rotateAnimRef.current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [rotateAnim]);

  // rotateAnim is a stable Animated.Value ref; calling .interpolate() at render
  // time is the documented way to derive an animated style from it.
  // eslint-disable-next-line react-hooks/refs
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "10deg"],
  });

  const content = (
    <>
      <Avatar name={userName || "?"} imageUrl={avatarUrl} size={48} />
      <View className="flex-col gap-1">
        <View className="flex-row items-center gap-1">
          <Text className="text-body-sm font-medium text-fg-soft">
            {greeting}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="hand-left" size={16} color={colors.brand} />
          </Animated.View>
        </View>
        <Text numberOfLines={1} className="text-[19px] font-bold text-fg">
          {userName}
        </Text>
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View
        accessibilityLabel={`${userName}${role ? `, ${role}` : ""}`}
        className="mr-2 flex-row items-center gap-2.5"
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${userName}${role ? `, ${role}` : ""}`}
      className="mr-2 flex-row items-center gap-2.5"
      android_ripple={undefined}
    >
      {content}
    </Pressable>
  );
}

/** Header pill button that opens the analytics sheet. */
export function HeaderAnalyzeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Analyze"
      className="mr-2 h-12 flex-row items-center gap-1.5 rounded-full bg-subtle px-3.5"
      android_ripple={undefined}
    >
      <Ionicons name="stats-chart" size={16} color={colors.brand} />
      <Text className="text-caption font-semibold text-brand-strong">Analyze</Text>
    </Pressable>
  );
}

/** Bell button with an unread dot, reading unread state from the store. */
export function HeaderNotificationButton({ onPress }: { onPress?: () => void }) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const hasUnread = unreadCount > 0;

  return (
    <IconButton
      icon="notifications-outline"
      accessibilityLabel={hasUnread ? `Notifications, ${unreadCount} unread` : "Notifications"}
      onPress={onPress}
      badge={
        hasUnread ? (
          <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-subtle bg-error" />
        ) : undefined
      }
    />
  );
}
