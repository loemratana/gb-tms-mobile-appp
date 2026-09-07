import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { ChartCard } from "@/features/manager/components/analytics/ChartCard";
import {
  buildAreaPath,
  buildSmoothPath,
  getChartScale,
} from "@/features/manager/components/analytics/chartUtils";
import { type WeeklyProductivityDatum } from "@/features/manager/data/analytics";

const WIDTH = 320;
const HEIGHT = 200;

type ProductivityChartProps = {
  data: WeeklyProductivityDatum[];
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  const progress = useSharedValue(0);
  const values = data.map((item) => item.completed);
  const hasCompletions = values.some((value) => value > 0);
  const scaleY = getChartScale(values, HEIGHT);

  const points = useMemo(
    () => data.map((item) => ({ x: 0, y: scaleY(item.completed) })),
    [data, scaleY]
  );

  const linePath = useMemo(
    () => buildSmoothPath(points, WIDTH, HEIGHT),
    [points]
  );

  const areaPath = useMemo(
    () => buildAreaPath(linePath, WIDTH, HEIGHT),
    [linePath]
  );

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const chartStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  if (!hasCompletions) {
    return (
      <ChartCard title="Weekly Productivity" subtitle="Tasks completed per day">
        <View className="items-center justify-center py-10">
          <Text className="text-[13px] font-semibold text-[#111827]">
            No completed tasks yet
          </Text>
          <Text className="mt-1 text-center text-[12px] text-[#9CA3AF]">
            Tasks you&apos;ve assigned will show up here once someone marks one done.
          </Text>
        </View>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Weekly Productivity" subtitle="Tasks completed per day">
      <Animated.View className="items-center" style={chartStyle}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#32CD32" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#32CD32" stopOpacity={0} />
            </LinearGradient>
          </Defs>

          <Path d={areaPath} fill="url(#areaFill)" />
          <Path
            d={linePath}
            stroke="#32CD32"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <View className="mt-1 flex-row justify-between px-1">
        {data.map((item) => (
          <Text key={item.day} className="text-[11px] text-[#9CA3AF]">
            {item.day}
          </Text>
        ))}
      </View>
    </ChartCard>
  );
}
