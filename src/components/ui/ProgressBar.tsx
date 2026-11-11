import { View } from "react-native";

import { toneColors, type Tone } from "@/styles";

type ProgressBarProps = {
  /** 0–100; clamped. */
  value: number;
  tone?: Tone | "brand";
  /** Track thickness in px. */
  height?: 4 | 6 | 8;
  accessibilityLabel?: string;
};

/** Horizontal progress track. Brand green by default. */
export function ProgressBar({ value, tone = "brand", height = 6, accessibilityLabel = "Progress" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fill = tone === "brand" ? undefined : toneColors[tone].color;

  return (
    <View
      className="w-full overflow-hidden rounded-full bg-subtle"
      style={{ height }}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View
        className={`h-full rounded-full ${fill ? "" : "bg-brand"}`}
        style={{ width: `${clamped}%`, ...(fill ? { backgroundColor: fill } : null) }}
      />
    </View>
  );
}
