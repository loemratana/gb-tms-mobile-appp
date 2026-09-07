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
        <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
          Analytics
        </Text>
        <Text className="mt-1 text-[18px] font-bold tracking-tight text-[#111827]">
          Tasks you&apos;ve assigned
        </Text>
        <Text className="mt-0.5 text-[12px] text-[#6B7280]">
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
          <Text className="text-[14px] font-semibold text-[#2563EB]">
            See all
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
