import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";

import { ChartSection } from "./ChartSection";
import {
  buildAreaPath,
  buildSmoothPath,
  getChartScale,
} from "./chartUtils";
import { type WeeklyProductivityDatum } from "@/features/dashboard/utils/analytics";
import { APP_FONT_FAMILY, colors } from "@/styles";

const WIDTH = 320;
const HEIGHT = 200;
/** Must match buildSmoothPath's default padding, so labels sit on the points. */
const PADDING = { left: 20, right: 20, top: 24, bottom: 24 };

type ProductivityChartProps = {
  data: WeeklyProductivityDatum[];
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  const progress = useSharedValue(0);
  const values = data.map((item) => item.completed);
  const hasCompletions = values.some((value) => value > 0);
  const weekTotal = values.reduce((sum, value) => sum + value, 0);
  // Extra top padding leaves room for the value label above the highest point.
  const scaleY = getChartScale(values, HEIGHT, { top: PADDING.top, bottom: PADDING.bottom });

  const points = useMemo(() => {
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
    return data.map((item, index) => ({
      x: PADDING.left + step * index,
      y: scaleY(item.completed),
      ...item,
    }));
  }, [data, scaleY]);

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
      <ChartSection title="Completed this week" subtitle="Tasks finished per day, last 7 days">
        <View className="items-center justify-center rounded-2xl bg-field py-8">
          <Text className="text-caption font-semibold text-fg">
            Nothing completed in the last 7 days
          </Text>
          <Text className="mt-1 text-center text-label text-fg-faint">
            Tasks you&apos;ve assigned show up here once someone completes one.
          </Text>
        </View>
      </ChartSection>
    );
  }

  return (
    <ChartSection
      title="Completed this week"
      subtitle="Tasks finished per day, last 7 days"
      meta={`${weekTotal} done`}
    >
      <Animated.View
        className="items-center"
        style={chartStyle}
        accessible
        accessibilityLabel={`Tasks completed per day: ${data
          .map((item) => `${item.day} ${item.completed}`)
          .join(", ")}`}
      >
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.brand} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={colors.brand} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Faint baseline so the curve has something to sit on. */}
          <Line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={HEIGHT - PADDING.bottom}
            y2={HEIGHT - PADDING.bottom}
            stroke={colors.divider}
            strokeWidth={1}
          />
          <Path d={areaPath} fill="url(#areaFill)" />
          <Path
            d={linePath}
            stroke={colors.brand}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <Circle
              key={`dot-${point.day}-${point.x}`}
              cx={point.x}
              cy={point.y}
              r={3}
              fill={colors.surface}
              stroke={colors.brand}
              strokeWidth={2}
            />
          ))}

          {points.map((point) =>
            point.completed > 0 ? (
              <SvgText
                key={`value-${point.day}-${point.x}`}
                x={point.x}
                y={point.y - 9}
                fontFamily={APP_FONT_FAMILY}
                fontSize={11}
                fontWeight="600"
                fill={colors.text}
                textAnchor="middle"
              >
                {point.completed}
              </SvgText>
            ) : null
          )}

          {points.map((point) => (
            <SvgText
              key={`day-${point.day}-${point.x}`}
              x={point.x}
              y={HEIGHT - 6}
              fontFamily={APP_FONT_FAMILY}
              fontSize={11}
              fill={colors.textSubtle}
              textAnchor="middle"
            >
              {point.day}
            </SvgText>
          ))}
        </Svg>
      </Animated.View>
    </ChartSection>
  );
}
