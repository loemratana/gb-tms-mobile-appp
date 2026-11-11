import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "@/styles";

type PropertyRowProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  /** Plain text, or any element (badge, avatars, button). */
  value: ReactNode;
  hasDivider?: boolean;
};

/** One "label → value" line in a task's Details card. */
export function PropertyRow({ icon, label, value, hasDivider = false }: PropertyRowProps) {
  return (
    <View className={`min-h-[48px] flex-row items-center gap-3 py-2.5 ${hasDivider ? "border-t border-line-soft" : ""}`}>
      <Ionicons name={icon} size={18} color={colors.textSubtle} />
      <Text className="w-24 text-caption text-fg-soft">{label}</Text>
      <View className="min-w-0 flex-1 items-end">
        {typeof value === "string" ? (
          <Text className="text-body-sm font-medium text-fg" numberOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}
