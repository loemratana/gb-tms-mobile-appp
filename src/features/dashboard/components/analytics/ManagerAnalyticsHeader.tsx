import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

type ManagerAnalyticsHeaderProps = {
  onSeeTopPerformers?: () => void;
};

/** Sheet title, plus a shortcut to the top-performers podium when there's anyone to rank. */
export function ManagerAnalyticsHeader({ onSeeTopPerformers }: ManagerAnalyticsHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-title font-bold text-fg" accessibilityRole="header">
          Team analytics
        </Text>
        <Text className="mt-0.5 text-label text-fg-soft">Tasks you&apos;ve assigned</Text>
      </View>

      {onSeeTopPerformers ? (
        <Pressable
          onPress={onSeeTopPerformers}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="See top performers"
          className="h-9 flex-row items-center gap-1.5 rounded-full bg-warning-subtle px-3.5 active:opacity-70"
        >
          <Ionicons name="trophy" size={15} color={colors.warning} />
          <Text className="text-label font-semibold text-warning-fg">Top performers</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
