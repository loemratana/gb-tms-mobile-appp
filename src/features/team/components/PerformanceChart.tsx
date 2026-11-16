import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import type { ChartSlice } from "@/features/team/utils/performanceDisplay";
import { colors } from "@/styles";

const RADIUS = 64;
const INNER_RADIUS = 44;

type PerformanceChartProps = {
  /** Names the chart for screen readers. */
  title: string;
  slices: ChartSlice[];
  /** Big number in the hole (e.g. the task total) and its caption. */
  centerValue: number;
  centerCaption?: string;
  /** Adds a bold first legend row for the whole (e.g. "Assigned"), which the slices add up to. */
  totalLabel?: string;
};

/** Doughnut chart with a legend of counts and percentages. */
export function PerformanceChart({ title, slices, centerValue, centerCaption, totalLabel }: PerformanceChartProps) {
  const parts = slices.map((slice) => `${slice.label} ${slice.value}, ${slice.percent}%`);
  const summary = (totalLabel ? [`${totalLabel} ${centerValue}`, ...parts] : parts).join("; ");

  return (
    <View className="flex-row items-center gap-4">
      <View accessible accessibilityLabel={`${title}: ${summary}`}>
        <PieChart
          data={slices.map((slice) => ({ value: slice.value, color: slice.color }))}
          donut
          radius={RADIUS}
          innerRadius={INNER_RADIUS}
          innerCircleColor={colors.surface}
          // Thin gaps between slices so neighbouring colours stay readable.
          strokeWidth={slices.length > 1 ? 2 : 0}
          strokeColor={colors.surface}
          isAnimated
          animationDuration={600}
          centerLabelComponent={() => (
            <View className="items-center">
              <Text className="text-title font-bold text-fg">{centerValue}</Text>
              {centerCaption ? <Text className="text-micro text-fg-faint">{centerCaption}</Text> : null}
            </View>
          )}
        />
      </View>

      <View className="min-w-0 flex-1 gap-1.5">
        {totalLabel ? (
          <View className="mb-0.5 flex-row items-center border-b border-line-soft pb-1.5">
            <View className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: colors.text }} />
            <Text className="ml-2 flex-1 text-caption font-semibold text-fg" numberOfLines={1}>
              {totalLabel}
            </Text>
            <Text className="text-caption font-bold text-fg">{centerValue}</Text>
            <Text className="w-10 text-right text-label text-fg-faint">100%</Text>
          </View>
        ) : null}
        {slices.map((slice) => (
          <View key={slice.key} className="flex-row items-center">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <Text className="ml-2 flex-1 text-caption text-fg-sub" numberOfLines={1}>
              {slice.label}
            </Text>
            <Text className="text-caption font-semibold text-fg">{slice.value}</Text>
            <Text className="w-10 text-right text-label text-fg-faint">{slice.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
