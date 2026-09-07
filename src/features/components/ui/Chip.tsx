import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, pressScale } from "@/constants/theme";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active = false, onPress }: ChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(pressScale, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          minHeight: 36,
          justifyContent: "center",
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: active ? colors.primary : colors.background,
          borderWidth: active ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: active ? "#FFFFFF" : colors.textMuted,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function SegmentOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(pressScale, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={{
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          backgroundColor: selected ? colors.primary : colors.card,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: selected ? "#FFFFFF" : colors.textMuted,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
