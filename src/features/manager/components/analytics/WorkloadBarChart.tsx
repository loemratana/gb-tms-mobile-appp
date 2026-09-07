import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";

import { ChartCard } from "@/features/manager/components/analytics/ChartCard";
import { getChartScale } from "@/features/manager/components/analytics/chartUtils";
import { type EmployeeWorkloadDatum } from "@/features/manager/data/analytics";

const WIDTH = 320;
const HEIGHT = 200;
const PADDING = { left: 24, right: 24, top: 16, bottom: 28 };
const BAR_RADIUS = 8;

type WorkloadBarChartProps = {
  data: EmployeeWorkloadDatum[];
};

export function WorkloadBarChart({ data }: WorkloadBarChartProps) {
  const progress = useSharedValue(0);
  const values = data.map((item) => item.tasks);
  const scaleY = getChartScale(values, HEIGHT, {
    top: PADDING.top,
    bottom: PADDING.bottom,
  });

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const barGap = 12;
  const barWidth = (plotWidth - barGap * (data.length - 1)) / data.length;
  const baseline = HEIGHT - PADDING.bottom;

  const bars = useMemo(
    () =>
      data.map((item, index) => {
        const x = PADDING.left + index * (barWidth + barGap);
        const y = scaleY(item.tasks);
        const height = baseline - y;

        return { ...item, x, y, height };
      }),
    [barWidth, baseline, data, scaleY]
  );

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const chartStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 8 }],
  }));

  return (
    <ChartCard title="Employee Workload" subtitle="Assigned tasks by teammate">
      <Animated.View className="items-center" style={chartStyle}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {bars.map((bar) => (
            <Rect
              key={bar.id}
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              fill="#32CD32"
            />
          ))}
        </Svg>
      </Animated.View>

      <View className="mt-1 flex-row justify-between px-2">
        {data.map((item) => (
          <Text
            key={item.id}
            numberOfLines={1}
            className="max-w-[52px] text-center text-[11px] text-[#9CA3AF]"
          >
            {item.name}
          </Text>
        ))}
      </View>
    </ChartCard>
  );
}
