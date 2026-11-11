import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors } from "@/styles";

export type StateViewVariant = "empty" | "error";

type StateViewProps = {
  variant: StateViewVariant;
  title: string;
  message?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  actionLabel?: string;
  onPressAction?: () => void;
  /** Inside a card/list area (padded panel) vs. filling a screen region. */
  isCompact?: boolean;
};

const DEFAULT_ICON: Record<StateViewVariant, ComponentProps<typeof Ionicons>["name"]> = {
  empty: "file-tray-outline",
  error: "cloud-offline-outline",
};

/** One pattern for every empty and error state. */
export function StateView({
  variant,
  title,
  message,
  icon,
  actionLabel,
  onPressAction,
  isCompact = false,
}: StateViewProps) {
  return (
    <View
      className={`items-center ${isCompact ? "rounded-2xl border border-dashed border-line-strong px-6 py-8" : "px-8 py-14"}`}
      accessibilityRole={variant === "error" ? "alert" : undefined}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          variant === "error" ? "bg-error-subtle" : "bg-subtle"
        }`}
      >
        <Ionicons
          name={icon ?? DEFAULT_ICON[variant]}
          size={24}
          color={variant === "error" ? colors.danger : colors.textSubtle}
        />
      </View>
      <Text className="mt-3 text-center text-headline font-semibold text-fg">{title}</Text>
      {message ? <Text className="mt-1 text-center text-caption text-fg-soft">{message}</Text> : null}
      {actionLabel && onPressAction ? (
        <View className="mt-4">
          <Button label={actionLabel} variant="outline" size="sm" isFullWidth={false} onPress={onPressAction} />
        </View>
      ) : null}
    </View>
  );
}
