import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { toneColors, type Tone } from "@/styles";

type BadgeProps = {
  label: string;
  tone?: Tone;
  /** Leading status dot (statuses). */
  hasDot?: boolean;
  /** Leading icon instead of a dot (e.g. flag for priority). */
  icon?: ComponentProps<typeof Ionicons>["name"];
};

/** Status / priority / role tag: light fill, coloured dot or icon, darker text. */
export function Badge({ label, tone = "neutral", hasDot = false, icon }: BadgeProps) {
  const colors = toneColors[tone];

  return (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: colors.subtle }}
    >
      {icon ? (
        <Ionicons name={icon} size={11} color={colors.color} />
      ) : hasDot ? (
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.color }} />
      ) : null}
      <Text className="text-micro font-semibold" style={{ color: colors.fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
