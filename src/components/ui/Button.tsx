import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";

import { colors } from "@/styles";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
export type ButtonSize = "md" | "sm";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks presses. The label stays for screen readers. */
  isLoading?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  isFullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; text: string; pressed: string }> = {
  primary: { container: "bg-brand", text: "text-white", pressed: "bg-brand-strong" },
  secondary: { container: "bg-subtle", text: "text-fg", pressed: "bg-line" },
  outline: { container: "border border-line bg-surface", text: "text-fg", pressed: "bg-field" },
  ghost: { container: "bg-transparent", text: "text-brand-strong", pressed: "bg-brand-subtle" },
  destructive: { container: "bg-error", text: "text-white", pressed: "bg-error-fg" },
  success: { container: "bg-success", text: "text-white", pressed: "bg-success-fg" },
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.text,
  outline: colors.text,
  ghost: colors.brandStrong,
  destructive: colors.textInverse,
  success: colors.textInverse,
};

/** The app's one button. Variants and sizes are documented in docs/design-system.md. */
export function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  isFullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = VARIANT_CLASSES[variant];
  const isDisabled = Boolean(disabled) || isLoading;
  const sizeClass = size === "md" ? "h-12 px-5 gap-2" : "h-9 px-3.5 gap-1.5";
  const textSize = size === "md" ? "text-headline" : "text-body-sm";

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={isFullWidth ? "w-full" : "self-start"}
    >
      {({ pressed }) => (
        <View
          className={`flex-row items-center justify-center rounded-xl ${sizeClass} ${
            pressed && !isDisabled ? classes.pressed : classes.container
          }`}
          style={{ opacity: isDisabled && !isLoading ? 0.5 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={SPINNER_COLOR[variant]} />
          ) : (
            <>
              {icon ? (
                <Ionicons
                  name={icon}
                  size={size === "md" ? 18 : 16}
                  color={SPINNER_COLOR[variant]}
                />
              ) : null}
              <Text className={`${textSize} font-semibold ${classes.text}`} numberOfLines={1}>
                {label}
              </Text>
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}
