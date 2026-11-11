import { useState } from "react";
import { Text, View } from "react-native";
import { BarChart, type barDataItem } from "react-native-gifted-charts";

import type { MonthlyTaskCount } from "@/features/dashboard/utils/taskStatistics";
import { colors, palette, withAlpha } from "@/styles";

const CHART_HEIGHT = 180;
const Y_AXIS_LABEL_WIDTH = 28;
const SECTIONS = 4;
const BAR_WIDTH_RATIO = 0.6;

type TasksPerMonthBarChartProps = {
  months: MonthlyTaskCount[];
  /** Month index to emphasise (e.g. the current month); others render lighter. */
  highlightedMonth: number | null;
};

/** Rounds the axis maximum up so every section line lands on a whole number. */
function getAxisMax(values: number[]): number {
  const highest = Math.max(...values, 0);
  return Math.max(SECTIONS, Math.ceil(highest / SECTIONS) * SECTIONS);
}

/** Total tasks per month as a bar chart, sized to fill its container. */
export function TasksPerMonthBarChart({ months, highlightedMonth }: TasksPerMonthBarChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const plotWidth = Math.max(0, containerWidth - Y_AXIS_LABEL_WIDTH);
  const slotWidth = months.length > 0 ? plotWidth / months.length : 0;
  const barWidth = slotWidth * BAR_WIDTH_RATIO;
  const spacing = slotWidth - barWidth;

  const barData: barDataItem[] = months.map((item) => {
    const isHighlighted = highlightedMonth === null || item.month === highlightedMonth;
    return {
      value: item.count,
      label: item.label,
      labelWidth: slotWidth,
      frontColor: isHighlighted ? colors.brand : withAlpha(colors.brand, 0.45),
      topLabelComponent: () =>
        item.count > 0 ? (
          <Text className="mb-0.5 text-[10px] font-semibold text-fg-sub">{item.count}</Text>
        ) : null,
    };
  });

  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Tasks per month: ${months
        .map((item) => `${item.label} ${item.count}`)
        .join(", ")}`}
    >
      {containerWidth > 0 ? (
        <BarChart
          data={barData}
          width={plotWidth}
          height={CHART_HEIGHT}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={spacing / 2}
          endSpacing={spacing / 2}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          maxValue={getAxisMax(months.map((item) => item.count))}
          noOfSections={SECTIONS}
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={palette.gray[200]}
          rulesColor={palette.gray[100]}
          rulesType="solid"
          yAxisTextStyle={{ color: palette.gray[400], fontSize: 11 }}
          xAxisLabelTextStyle={{ color: palette.gray[500], fontSize: 10, textAlign: "center" }}
          disableScroll
          isAnimated
          animationDuration={600}
        />
      ) : (
        <View style={{ height: CHART_HEIGHT + 32 }} />
      )}
    </View>
  );
}
