import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";

const AnimatedLine = Animated.createAnimatedComponent(Line);

const SEGMENTS = 72;
const SVG_HEIGHT = 30;
const CENTER_Y = SVG_HEIGHT / 2;
const BASE_LINE = 10;
const PEAK_LINE = 24;
const LINE_WIDTH = 1.4;
const GAP = 1.1;

const ACTIVE_COLOR = "#F59E0B";
const ACTIVE_DONE_COLOR = "#32CD32";
const INACTIVE_COLOR = "#E5E7EB";

type SegmentedProgressBarProps = {
  progress: number;
  label?: string;
  activeColor?: string;
  animated?: boolean;
};

export function SegmentedProgressBar({
  progress,
  label = "Progress",
  activeColor,
  animated = true,
}: SegmentedProgressBarProps) {
  const animatedProgress = useSharedValue(0);
  const clamped = Math.max(0, Math.min(100, progress));
  const fillColor = activeColor ?? (clamped >= 100 ? ACTIVE_DONE_COLOR : ACTIVE_COLOR);

  useEffect(() => {
    if (!animated) {
      animatedProgress.value = clamped / 100;
      return;
    }

    animatedProgress.value = withTiming(clamped / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [animated, animatedProgress, clamped]);

  if (!animated) {
    return (
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[13px] font-semibold text-[#111827]">{label}</Text>
          <Text className="text-[13px] font-bold" style={{ color: fillColor }}>
            {clamped}%
          </Text>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <View
            className="h-full rounded-full"
            style={{ width: `${clamped}%`, backgroundColor: fillColor }}
          />
        </View>
      </View>
    );
  }

  const step = (100 - GAP * (SEGMENTS - 1)) / SEGMENTS;

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-[#111827]">{label}</Text>
        <Text className="text-[13px] font-bold" style={{ color: fillColor }}>
          {clamped}%
        </Text>
      </View>

      <Svg
        width="100%"
        height={SVG_HEIGHT}
        viewBox={`0 0 100 ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <ProgressTick
            key={index}
            index={index}
            x={step / 2 + index * (step + GAP)}
            animatedProgress={animatedProgress}
            activeColor={fillColor}
            inactiveColor={INACTIVE_COLOR}
          />
        ))}
      </Svg>
    </View>
  );
}

type ProgressTickProps = {
  index: number;
  x: number;
  animatedProgress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
};

function ProgressTick({
  index,
  x,
  animatedProgress,
  activeColor,
  inactiveColor,
}: ProgressTickProps) {
  const animatedProps = useAnimatedProps(() => {
    const progressIndex = animatedProgress.value * (SEGMENTS - 1);
    const isFilled = index <= progressIndex;
    const dist = Math.abs(index - progressIndex);
    const peakFactor = Math.max(0, 1 - dist / 3.2);
    const height = BASE_LINE + (PEAK_LINE - BASE_LINE) * peakFactor * peakFactor;
    const half = height / 2;

    return {
      stroke: isFilled ? activeColor : inactiveColor,
      y1: CENTER_Y - half,
      y2: CENTER_Y + half,
    };
  });

  return (
    <AnimatedLine
      x1={x}
      x2={x}
      strokeWidth={LINE_WIDTH}
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}
