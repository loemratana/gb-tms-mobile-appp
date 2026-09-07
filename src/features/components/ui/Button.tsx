import { useCallback } from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, pressScale } from "@/constants/theme";

type ButtonVariant = "primary" | "success" | "danger" | "outline" | "ghost";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: colors.primary, text: "#FFFFFF" },
  success: { bg: colors.success, text: "#FFFFFF" },
  danger: { bg: colors.danger, text: "#FFFFFF" },
  outline: { bg: colors.card, text: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", text: colors.primary },
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const style = VARIANT_STYLES[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      scale.value = withSpring(pressScale, { damping: 18, stiffness: 320 });
      onPressIn?.(e);
    },
    [onPressIn, scale]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      scale.value = withSpring(1, { damping: 18, stiffness: 320 });
      onPressOut?.(e);
    },
    [onPressOut, scale]
  );

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: "100%" }]}>
      <Pressable
        {...rest}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          minHeight: 52,
          borderRadius: 12,
          backgroundColor: style.bg,
          borderWidth: style.border ? 1.5 : 0,
          borderColor: style.border,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled || loading ? 0.65 : 1,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: style.text }}>
          {loading ? "Creating..." : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function TextButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        minHeight: 44,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}
