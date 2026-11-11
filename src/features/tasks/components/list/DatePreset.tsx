import { Pressable, Text } from "react-native";

import { colors, withAlpha } from "@/styles";

/** RN styles need rgba, not a hex+alpha helper — tints the primary accent for the selected pill. */
const ACTIVE_TINT = withAlpha(colors.brand, 0.1);

type DatePresetProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

/** A bordered chip — filled + primary border when selected, outlined when idle. */
export function DatePreset({ label, active, onPress }: DatePresetProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      className="rounded-full border px-3.5 py-2"
      style={{
        backgroundColor: active ? ACTIVE_TINT : colors.card,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      <Text
        className="text-caption font-semibold"
        style={{ color: active ? colors.primary : colors.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
