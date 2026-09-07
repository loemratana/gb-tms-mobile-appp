import { Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const SIZE = 140;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type PerformanceCircleProps = {
  /** e.g. team completion rate, 0-100. */
  value: number;
  /** Week-over-week delta, if available. */
  growth?: number;
};

export function PerformanceCircle({
  value,
  growth,
}: PerformanceCircleProps) {
  const score = Math.max(0, Math.min(100, value));
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <View className="items-center">
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#E5E7EB"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#32CD32"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </G>
        </Svg>

        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <Text className="text-[32px] font-bold text-[#111827]">{score}%</Text>
        </View>
      </View>

      <Text className="mt-3 text-[14px] font-semibold text-[#374151]">
        Performance Score
      </Text>
      {growth !== undefined && (
        <Text className="mt-1 text-[12px] font-medium text-[#32CD32]">
          {growth >= 0 ? "+" : ""}
          {growth}% this week
        </Text>
      )}
    </View>
  );
}
