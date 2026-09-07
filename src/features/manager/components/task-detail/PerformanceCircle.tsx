import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 196;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RING_GLOW = Platform.select({
  ios: {
    shadowColor: "#32CD32",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
  },
  android: { elevation: 6 },
});

type PerformanceCircleProps = {
  value: number;
  label?: string;
};

export function PerformanceCircle({
  value,
  label = "Task Progress",
}: PerformanceCircleProps) {
  const progress = useSharedValue(0);
  const clamped = Math.max(0, Math.min(100, value));
  const target = clamped / 100;

  useEffect(() => {
    progress.value = withTiming(target, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <View
      className="items-center rounded-3xl border border-[#F3F4F6] bg-white py-6"
      style={RING_GLOW}
    >
      <Animated.View style={[{ width: SIZE, height: SIZE }, ringStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient
              id="taskProgressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#32CD32" />
              <Stop offset="100%" stopColor="#7CFF7C" />
            </LinearGradient>
          </Defs>

          <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#F3F4F6"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#32CD32"
              strokeWidth={STROKE + 8}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
              opacity={0.18}
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#taskProgressGradient)"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedProps}
            />
          </G>
        </Svg>

        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <Text className="text-[40px] font-bold tracking-tight text-[#111827]">
            {clamped}%
          </Text>
          <Text className="mt-1 text-[13px] font-semibold text-[#6B7280]">
            {label}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
