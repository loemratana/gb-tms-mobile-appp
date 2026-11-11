import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";

import { colors, palette } from "@/styles";

export type IconButtonVariant = "ghost" | "subtle" | "brand" | "success" | "overlay";

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  isDisabled?: boolean;
  /** Small dot in the corner, e.g. "filters applied" or unread. */
  hasIndicator?: boolean;
  /** Overrides the dot, e.g. an unread count badge. */
  badge?: ReactNode;
};

const VARIANTS: Record<IconButtonVariant, { idle: string; pressed: string; icon: string }> = {
  ghost: { idle: "bg-transparent", pressed: "bg-subtle", icon: colors.text },
  subtle: { idle: "bg-subtle", pressed: "bg-line", icon: colors.text },
  brand: { idle: "bg-brand-subtle", pressed: "bg-brand-border", icon: colors.brandStrong },
  /** Solid fill for a primary quick action, e.g. calling someone. */
  success: { idle: "bg-success", pressed: "bg-success-fg", icon: colors.textInverse },
  /** On photos and dark full-screen viewers: stays white in both themes. */
  overlay: { idle: "bg-white/15", pressed: "bg-white/25", icon: palette.white },
};

/** 40px round icon action (44px touch target via hitSlop) for headers and toolbars. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = "subtle",
  isDisabled = false,
  hasIndicator = false,
  badge,
}: IconButtonProps) {
  const style = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
    >
      {({ pressed }) => (
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${pressed ? style.pressed : style.idle}`}
          style={{ opacity: isDisabled ? 0.4 : 1 }}
        >
          <Ionicons name={icon} size={20} color={style.icon} />
          {badge ?? (hasIndicator ? (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full border border-surface bg-brand" />
          ) : null)}
        </View>
      )}
    </Pressable>
  );
}
