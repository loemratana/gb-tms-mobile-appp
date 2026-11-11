import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

export type CardVariant = "default" | "subtle";

type CardProps = Pick<ViewProps, "accessibilityLabel" | "accessibilityHint"> & {
  children: ReactNode;
  /** `default` = white surface with a soft outline; `subtle` = filled panel for summaries. */
  variant?: CardVariant;
  /** Drop the built-in padding (e.g. for lists of rows with their own padding). */
  isFlush?: boolean;
  onPress?: () => void;
  className?: string;
};

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: " bg-surface",
  subtle: "bg-subtle",
};

/** Content container. Cards use a border, not a shadow (docs/design-system.md). */
export function Card({ children, variant = "default", isFlush = false, onPress, className = "", ...a11y }: CardProps) {
  const classes = `rounded-2xl ${VARIANT_CLASSES[variant]} ${isFlush ? "" : "p-4"} ${className}`.trim();

  if (!onPress) {
    return (
      <View className={classes} {...a11y}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`${classes} active:bg-field`}
      {...a11y}
    >
      {children}
    </Pressable>
  );
}
