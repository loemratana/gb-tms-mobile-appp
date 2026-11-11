import { Pressable, Text, View } from "react-native";

type ManagerAnalyticsHeaderProps = {
  completionRate: number;
  pendingTasks?: number;
  hasData: boolean;
  onSeeAll?: () => void;
};

export function ManagerAnalyticsHeader({
  completionRate,
  pendingTasks,
  hasData,
  onSeeAll,
}: ManagerAnalyticsHeaderProps) {
  return (
    <View className="flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-caption font-semibold uppercase tracking-[1px] text-fg-faint">
          Analytics
        </Text>
        <Text className="mt-1 text-title font-bold tracking-tight text-fg">
          Tasks you&apos;ve assigned
        </Text>
        <Text className="mt-0.5 text-label text-fg-soft">
          {hasData
            ? `${completionRate}% completion · ${pendingTasks} pending`
            : "What you've handed out to the team"}
        </Text>
      </View>

      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all analytics"
        >
          <Text className="text-body-sm font-semibold text-brand-strong">
            See all
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
