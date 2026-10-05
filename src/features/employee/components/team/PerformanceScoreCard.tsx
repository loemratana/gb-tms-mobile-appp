import { Pressable, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

type PerformanceMetric = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
};

type PerformanceScoreCardProps = {
  score: number;
  level: string;
  summary: string;
  monthLabel: string;
  metrics: PerformanceMetric[];
  onPressViewFull?: () => void;
};

const SIZE = 132;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function metricToneColor(tone: PerformanceMetric["tone"]) {
  if (tone === "success") return "#16A34A";
  if (tone === "danger") return "#DC2626";
  return "#0F172A";
}

function KpiMetricCard({ label, value, tone = "default" }: PerformanceMetric) {
  return (
    <View className="w-[48.5%] border-b border-[#F3F4F6] pb-3">
      <Text className="text-[11px] font-medium text-[#6B7280]">{label}</Text>
      <Text
        className="mt-1 text-[16px] font-bold"
        style={{ color: metricToneColor(tone) }}
      >
        {value}
      </Text>
    </View>
  );
}

export function PerformanceScoreCard({
  score,
  level,
  summary,
  monthLabel,
  metrics,
  onPressViewFull,
}: PerformanceScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <View>
      {onPressViewFull ? (
        <Pressable
          onPress={onPressViewFull}
          accessibilityRole="button"
          className="mb-3 rounded-2xl bg-[#2563EB] px-4 py-3"
        >
          <Text className="text-center text-[15px] font-bold text-white">
            View Full Performance
          </Text>
        </Pressable>
      ) : null}

      <View className="border-t border-[#F3F4F6] pt-4">
        <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
          Performance Score
        </Text>

        <View className="mt-4 flex-row">
          <View className="items-center">
            <View style={{ width: SIZE, height: SIZE }}>
              <Svg width={SIZE} height={SIZE}>
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
                    stroke="#2563EB"
                    strokeWidth={STROKE}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                  />
                </G>
              </Svg>

              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-[26px] font-extrabold text-[#111827]">
                  {clamped}%
                </Text>
              </View>
            </View>
          </View>

          <View className="ml-4 flex-1 justify-center">
            <Text className="text-[18px] font-bold text-[#111827]">
              {level}
            </Text>
            <Text className="mt-0.5 text-[12px] font-medium text-[#9CA3AF]">
              {monthLabel}
            </Text>
            <Text className="mt-2 text-[12px] leading-5 text-[#6B7280]">
              {summary}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
        {metrics.map((metric) => (
          <KpiMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            tone={metric.tone}
          />
        ))}
      </View>
    </View>
  );
}
