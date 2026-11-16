import { Text, View } from "react-native";

import { type TaskStatusDonutDatum } from "@/features/dashboard/utils/analytics";

import { ChartSection } from "./ChartSection";

type StatusBreakdownProps = {
  data: readonly TaskStatusDonutDatum[];
};

function percentOf(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

/**
 * Where the assigned tasks stand: one segmented bar for the overall picture, then each status with
 * its count and share — readable at a glance, no tapping needed.
 */
export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartSection title="Status breakdown" meta={`${total} ${total === 1 ? "task" : "tasks"}`}>
      <View
        className="h-3 flex-row overflow-hidden rounded-full bg-subtle"
        accessible
        accessibilityLabel={data.map((item) => `${item.label} ${item.count}`).join(", ")}
      >
        {data.map((item, index) => (
          <View
            key={item.status}
            style={{
              flex: item.count,
              backgroundColor: item.color,
              // A hairline gap between segments keeps neighbouring colours distinct.
              marginLeft: index > 0 ? 2 : 0,
            }}
          />
        ))}
      </View>

      <View className="mt-4">
        {data.map((item, index) => (
          <View
            key={item.status}
            className={`flex-row items-center gap-3 py-2.5 ${index > 0 ? "border-t border-line-soft" : ""}`}
          >
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <Text className="flex-1 text-body-sm text-fg-sub">{item.label}</Text>
            <Text className="text-body-sm font-semibold text-fg">{item.count}</Text>
            <Text className="w-11 text-right text-label text-fg-faint">{percentOf(item.count, total)}%</Text>
          </View>
        ))}
      </View>
    </ChartSection>
  );
}
