import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import { ChartCard } from "@/features/manager/components/analytics/ChartCard";
import { type TaskStatusDonutDatum } from "@/features/manager/data/analytics";

const CHART_RADIUS = 72;
const INNER_RADIUS = 46;

type StatusDonutChartProps = {
  data: readonly TaskStatusDonutDatum[];
};

function toPieData(
  items: readonly TaskStatusDonutDatum[],
  focusedIndex = -1,
) {
  return items.map((item, index) => ({
    value: item.count,
    color: item.color,
    focused: focusedIndex >= 0 && index === focusedIndex,
  }));
}

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  const chartData = data;

  const dataKey = useMemo(
    () => chartData.map((item) => `${item.status}:${item.count}`).join("|"),
    [chartData],
  );

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.count, 0),
    [chartData],
  );

  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [dataKey]);

  const pieData = useMemo(
    () => toPieData(chartData, selectedIndex),
    [chartData, selectedIndex],
  );

  const handleSlicePress = useCallback((_item: unknown, index: number) => {
    setSelectedIndex((current) => (current === index ? -1 : index));
  }, []);

  const selectedItem = selectedIndex >= 0 ? chartData[selectedIndex] : null;
  const selectedPercent =
    selectedItem && total > 0
      ? Math.round((selectedItem.count / total) * 100)
      : 0;

  return (
    <ChartCard
      title="Task Status"
      subtitle={
        selectedItem
          ? `${selectedItem.label} · ${selectedPercent}% of total`
          : "Tap a slice to show details"
      }
    >
      <View className="items-center">
        <PieChart
          data={pieData}
          donut
          radius={CHART_RADIUS}
          innerRadius={INNER_RADIUS}
          innerCircleColor="#FFFFFF"
          focusOnPress
          extraRadius={10}
          toggleFocusOnPress={false}
          onPress={handleSlicePress}
          isAnimated
          animationDuration={800}
          centerLabelComponent={() => (
            <View className="items-center justify-center px-2">
              {selectedItem ? (
                <>
                  <Text
                    className="text-[24px] font-bold"
                    style={{ color: selectedItem.color }}
                  >
                    {selectedItem.count}
                  </Text>
                  <Text
                    className="text-center text-[11px] font-medium text-[#374151]"
                    numberOfLines={2}
                  >
                    {selectedItem.label}
                  </Text>
                  <Text className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    {selectedPercent}%
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-[24px] font-bold text-[#111827]">
                    {total}
                  </Text>
                  <Text className="text-[11px] text-[#6B7280]">Total tasks</Text>
                </>
              )}
            </View>
          )}
        />
      </View>

      <View className="mt-4 gap-2">
        {chartData.map((item, index) => {
          const isSelected = selectedIndex === index;

          return (
            <Pressable
              key={item.status}
              onPress={() => handleSlicePress(item, index)}
              className={`flex-row items-center justify-between rounded-lg px-2 py-1.5 ${
                isSelected ? "bg-[#F3F4F6]" : ""
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.label}, ${item.count} tasks`}
            >
              <View className="flex-row items-center gap-2">
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text
                  className={`text-[13px] ${
                    isSelected
                      ? "font-semibold text-[#111827]"
                      : "text-[#374151]"
                  }`}
                >
                  {item.label}
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-[#111827]">
                {item.count}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ChartCard>
  );
}
