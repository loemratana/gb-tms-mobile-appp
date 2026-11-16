import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { PerformanceChart } from "@/features/team/components/PerformanceChart";
import { RATING_DISPLAY, formatAvgDays, getAssignedSlices } from "@/features/team/utils/performanceDisplay";
import type { UserPerformanceResponse } from "@/features/users/types/user.types";
import { colors } from "@/styles";

type PerformanceCardProps = {
  performance: UserPerformanceResponse;
};

/** One person's performance for the chosen period: rating and score, and a doughnut of assigned → completed / overdue / open. */
export function PerformanceCard({ performance }: PerformanceCardProps) {
  const { tasks } = performance;

  if (tasks.total === 0) {
    return (
      <View className="items-center rounded-2xl border border-line bg-surface px-4 py-6">
        <Ionicons name="analytics-outline" size={28} color={colors.textSubtle} />
        <Text className="mt-2 text-body-sm font-semibold text-fg">No tasks in this period</Text>
        <Text className="mt-1 text-center text-caption text-fg-soft">Choose a wider date range to see performance.</Text>
      </View>
    );
  }

  const rating = RATING_DISPLAY[performance.rating];
  const score = Math.max(0, Math.min(100, Math.round(performance.performanceScore)));
  const slices = getAssignedSlices(performance);

  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Badge label={rating.label} tone={rating.tone} hasDot />
        <Text className="text-caption text-fg-soft" accessibilityLabel={`Performance score ${score} out of 100`}>
          Score <Text className="font-bold text-fg">{score}</Text>/100
        </Text>
      </View>

      <PerformanceChart
        title="Assigned tasks"
        slices={slices}
        centerValue={tasks.total}
        centerCaption="assigned"
        totalLabel="Assigned"
      />

      <View className="mt-4 flex-row items-center justify-between border-t border-line-soft pt-3">
        <Text className="text-caption text-fg-soft">Average time to finish</Text>
        <Text className="text-caption font-semibold text-fg">{formatAvgDays(performance.effort.avgCompletionDays)}</Text>
      </View>
    </View>
  );
}
