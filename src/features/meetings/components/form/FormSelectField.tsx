import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

type FormSelectFieldProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  value: string;
  placeholder?: string;
  accessibilityLabel: string;
  hasChevron?: boolean;
  hasError?: boolean;
  onPress: () => void;
};

/** Rounded field that opens a picker (date, time, room) instead of taking typed input. */
export function FormSelectField({
  icon,
  value,
  placeholder,
  accessibilityLabel,
  hasChevron = false,
  hasError = false,
  onPress,
}: FormSelectFieldProps) {
  const isEmpty = !value;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${accessibilityLabel}: ${value || placeholder || "not set"}`}
      className={`h-12 flex-row items-center gap-2.5 rounded-full border bg-surface px-4 active:bg-field ${
        hasError ? "border-error" : "border-line"
      }`}
    >
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text
        className={`min-w-0 flex-1 text-body ${isEmpty ? "text-fg-faint" : "font-medium text-fg"}`}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {hasChevron ? <View><Ionicons name="chevron-down" size={18} color={colors.textMuted} /></View> : null}
    </Pressable>
  );
}
