import { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { TabSfIcon } from "@/features/components/navigation/TabSfIcon";
import type { TabSfIconConfig } from "@/features/components/navigation/tabIcons";
import { colors } from "@/styles";

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = colors.textMuted;
// colors.primary ("#2563EB") at 12% opacity — RN styles need rgba, not a hex+alpha helper.
const ACTIVE_PILL_BACKGROUND = "rgba(37, 99, 235, 0.12)";
const ICON_SIZE = 26;
const PILL_WIDTH = 48;
const PILL_HEIGHT = 34;
const FOCUS_SPRING_CONFIG = { damping: 16, stiffness: 220, mass: 0.5 };
const PRESS_ANIMATION_DURATION = 100;
const PRESS_SCALE = 0.94;

type TabButtonProps = {
  config: TabSfIconConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabButton({ config, isFocused, onPress, onLongPress }: TabButtonProps) {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, FOCUS_SPRING_CONFIG);
  }, [isFocused, focusProgress]);

  // Immediate touch-down feedback, independent of the slower focus transition below —
  // fires on every press regardless of whether the tab is already active.
  const handlePressIn = useCallback(() => {
    pressScale.value = withTiming(PRESS_SCALE, { duration: PRESS_ANIMATION_DURATION });
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withTiming(1, { duration: PRESS_ANIMATION_DURATION });
  }, [pressScale]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [1, 1.06]) }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [0.7, 1]) }],
  }));

  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      className="w-full flex-1 items-center justify-center"
    >
      <Animated.View style={pressStyle} className="w-full items-center justify-center">
        <View
          style={{ height: PILL_HEIGHT, width: PILL_WIDTH }}
          className="items-center justify-center"
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                height: PILL_HEIGHT,
                width: PILL_WIDTH,
                borderRadius: PILL_HEIGHT / 2,
                backgroundColor: ACTIVE_PILL_BACKGROUND,
              },
              pillStyle,
            ]}
          />

          <Animated.View style={iconStyle}>
            <TabSfIcon config={config} isFocused={isFocused} size={ICON_SIZE} color={color} />
          </Animated.View>
        </View>

        <Text
          numberOfLines={1}
          className="mt-0.5 w-full text-center text-[10px]"
          style={{ color, fontWeight: isFocused ? "600" : "500" }}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
