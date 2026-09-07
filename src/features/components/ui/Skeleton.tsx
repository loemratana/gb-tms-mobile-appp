import { useEffect } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/styles";

/** Shared pulsing-opacity animation (0.4↔1, 700ms) every skeleton placeholder uses. */
export function useSkeletonPulse() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      true
    );
  }, [opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/** Base shimmering rectangle every skeleton layout is built from. */
export function SkeletonBlock({
  width,
  height = 12,
  radius = 6,
  backgroundColor = colors.mutedBg,
  style,
  className,
}: SkeletonBlockProps) {
  const shimmerStyle = useSkeletonPulse();
  // `width` stays out of this object when unset so a className width utility
  // (e.g. `w-2/3`) isn't clobbered by an explicit `undefined` in the style array.
  const dimensionStyle: ViewStyle = { height, borderRadius: radius, backgroundColor };
  if (width !== undefined) dimensionStyle.width = width;

  return (
    <Animated.View
      className={className}
      style={[dimensionStyle, shimmerStyle, style]}
    />
  );
}

/** Shimmering circle — avatars, icon bubbles. */
export function SkeletonCircle({
  size,
  backgroundColor = colors.mutedBg,
  style,
  className,
}: {
  size: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <SkeletonBlock
      width={size}
      height={size}
      radius={size / 2}
      backgroundColor={backgroundColor}
      style={style}
      className={className}
    />
  );
}
