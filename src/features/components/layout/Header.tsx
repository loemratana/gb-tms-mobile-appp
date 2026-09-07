import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Image, Pressable, Text, View } from "react-native";

import { useNotificationStore } from "@/stores/notificationStore";
import { Hand } from "lucide-react-native";
import { useEffect, useRef } from "react";

type HeaderProfileProps = {
  userName: string;
  avatarUrl: string;
  role?: string;
  onPress?: () => void;
};

type HeaderNotificationProps = {
  hasNotification?: boolean;
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

  const rotateAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "10deg"],
  });

  const content = (
    <>
      <Image
        source={{ uri: avatarUrl }}
        className="h-14 w-14 rounded-full bg-[#F3F4F6]"
      />
      <View className="flex-col gap-1">
        <View className="flex-row items-center gap-1">
          <Text className="text-[14px] font-medium text-[#DBEAFE]">
            {greeting}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Hand size={16} color="#38E02F" />
          </Animated.View>
        </View>
        <Text numberOfLines={1} className="text-[19px] font-bold text-white">
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
      android_ripple={null}
    >
      {content}
    </Pressable>
  );
}

/** Right side of the native Stack header bar. */
export function HeaderNotification({
  hasNotification = false,
  onPress,
}: HeaderNotificationProps) {
  const content = (
    <>
      <Ionicons name="notifications-outline" size={23} color="#FFFFFF" />
      {hasNotification ? (
        <View className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#2563EB] bg-[#EF4444]" />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        accessibilityLabel="Notifications"
        className="relative h-12 w-12 items-center justify-center rounded-full bg-white/20"
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      className="relative h-12 w-12 items-center justify-center rounded-full bg-white/20"
      android_ripple={null}
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
      className="mr-2 h-12 flex-row items-center gap-1.5 rounded-full bg-white/20 px-3.5"
      android_ripple={null}
    >
      <Ionicons name="stats-chart" size={16} color="#FFFFFF" />
      <Text className="text-[13px] font-semibold text-white">Analyze</Text>
    </Pressable>
  );
}

/** Bell button that reads unread state from the store. */
export function HeaderNotificationButton({
  onPress,
}: {
  onPress?: () => void;
}) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <HeaderNotification hasNotification={unreadCount > 0} onPress={onPress} />
  );
}

/** Center/left title for non-dashboard tabs. */
export function HeaderTitle({ title }: { title: string }) {
  return <Text className="text-[20px] font-bold text-white">{title}</Text>;
}
