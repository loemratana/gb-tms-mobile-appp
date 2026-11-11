import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { Badge } from "@/components/ui/Badge";
import type { PerformanceRating, UserPerformanceResponse } from "@/features/users/types/user.types";
import { colors, taskStatusTone, toneColors, type Tone } from "@/styles";

const CHART_RADIUS = 62;
const INNER_RADIUS = 46;

const RATING_DISPLAY: Record<PerformanceRating, { label: string; tone: Tone }> = {
  EXCELLENT: { label: "Excellent", tone: "success" },
  GOOD: { label: "Good", tone: "info" },
  AVERAGE: { label: "Average", tone: "warning" },
  NEEDS_IMPROVEMENT: { label: "Needs improvement", tone: "error" },
  NO_DATA: { label: "No tasks yet", tone: "neutral" },
};

type PerformanceCardProps = {
  performance: UserPerformanceResponse;
};

function Stat({
  label,
  value,
  isAlert = false,
  hasDivider = false,
}: {
  label: string;
  value: string | number;
  isAlert?: boolean;
  hasDivider?: boolean;
}) {
  return (
    <View
      className={`flex-1 items-center ${hasDivider ? "border-l border-line-soft" : ""}`}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text className={`text-title font-bold ${isAlert ? "text-error" : "text-fg"}`}>{value}</Text>
      <Text className="mt-0.5 text-label text-fg-soft">{label}</Text>
    </View>
  );
}

/** A teammate's performance analysis: completion donut, score and rating, key rates, and insights. */
export function PerformanceCard({ performance }: PerformanceCardProps) {
  const { tasks, rates, submissions } = performance;
  const rating = RATING_DISPLAY[performance.rating];
  const slices = [
    { key: "done", label: "Done", value: tasks.completed, color: toneColors[taskStatusTone.done].color },
    { key: "in_progress", label: "In progress", value: tasks.inProgress, color: toneColors[taskStatusTone.in_progress].color },
    { key: "review", label: "Review", value: tasks.inReview, color: toneColors[taskStatusTone.review].color },
    { key: "todo", label: "To do", value: tasks.todo, color: toneColors[taskStatusTone.todo].color },
  ];
  const chartData = slices.filter((slice) => slice.value > 0).map((slice) => ({ value: slice.value, color: slice.color }));

  return (
    <View className="rounded-2xl bg-field p-4">
      <View className="flex-row items-center gap-5">
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            donut
            radius={CHART_RADIUS}
            innerRadius={INNER_RADIUS}
            innerCircleColor={colors.inputBg}
            isAnimated
            animationDuration={700}
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-title font-bold text-fg">{Math.round(rates.completionRate)}%</Text>
                <Text className="text-micro text-fg-soft">completed</Text>
              </View>
            )}
          />
        ) : (
          <View
            className="items-center justify-center rounded-full border-[16px] border-line-soft"
            style={{ width: CHART_RADIUS * 2, height: CHART_RADIUS * 2 }}
          >
            <Text className="text-micro text-fg-faint">No tasks</Text>
          </View>
        )}

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between">
            <Badge label={rating.label} tone={rating.tone} hasDot />
            {tasks.total > 0 ? (
              <Text
                className="text-caption font-semibold text-fg"
                accessibilityLabel={`Performance score ${performance.performanceScore} out of 100`}
              >
                {performance.performanceScore}/100
              </Text>
            ) : null}
          </View>
          <View className="mt-2">
            {slices.map((slice) => (
              <View
                key={slice.key}
                className="flex-row items-center py-1"
                accessible
                accessibilityLabel={`${slice.label}: ${slice.value} tasks`}
              >
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                <Text className="ml-2 flex-1 text-caption text-fg-sub">{slice.label}</Text>
                <Text className="text-caption font-semibold text-fg">{slice.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* <View className="mt-4 flex-row border-t border-line-soft pt-4">
        <Stat label="Assigned" value={tasks.total} />
        <Stat label="Active" value={tasks.active} hasDivider />
        <Stat label="Overdue" value={tasks.overdue} isAlert={tasks.overdue > 0} hasDivider />
      </View>

      <View className="mt-4 flex-row border-t border-line-soft pt-4">
        <Stat label="On time" value={`${Math.round(rates.onTimeRate)}%`} />
        <Stat label="First-pass" value={`${Math.round(submissions.firstPassApprovalRate)}%`} hasDivider />
        <Stat label="Avg days" value={performance.effort.avgCompletionDays ?? "—"} hasDivider />
      </View>

      {performance.insights.length > 0 ? (
        <View className="mt-4 gap-1.5 border-t border-line-soft pt-4">
          {performance.insights.map((insight) => (
            <View key={insight} className="flex-row gap-2">
              <Ionicons name="bulb-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-caption text-fg-sub">{insight}</Text>
            </View>
          ))}
        </View>
      ) : null} */}
    </View>
  );
}
