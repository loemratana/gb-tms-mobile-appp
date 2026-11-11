import { Pressable, Text, View } from "react-native";

import { colors, withAlpha } from "@/styles";

type ChipProps = {
  label: string;
  color?: string;
  count?: number;
  isActive?: boolean;
  hasDot?: boolean;
  selectedVariant?: "soft" | "solid";
  onPress?: () => void;
};

/** Fallback accent when no `color` is supplied. */
const FALLBACK_ACCENT = colors.textMuted;

export function Chip({
  label,
  color,
  count,
  isActive = false,
  hasDot = false,
  selectedVariant = "soft",
  onPress,
}: ChipProps) {
  const accent = color ?? FALLBACK_ACCENT;
  const solid = isActive && selectedVariant === "solid";

  const backgroundColor = solid
    ? accent
    : isActive
      ? withAlpha(accent, 0.12)
      : "transparent";

  const borderColor = solid
    ? accent
    : withAlpha(accent, isActive ? 0.35 : 0.2);

  const textColor = solid ? colors.textInverse : isActive ? accent : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
className="flex-row items-center rounded-lg px-3 py-2 active:opacity-80"      
style={{ backgroundColor, borderWidth: 1, borderColor }}
    >
      {hasDot ? (
        <View
          className="mr-1.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: solid ? colors.textInverse : accent }}
        />
      ) : null}

      <Text
        className="text-label font-semibold"
        style={{ color: textColor }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {typeof count === "number" ? (
        <Text
          className="ml-1 text-label font-medium"
          style={{ color: solid ? withAlpha(colors.textInverse, 0.75) : withAlpha(accent, 0.9) }}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}