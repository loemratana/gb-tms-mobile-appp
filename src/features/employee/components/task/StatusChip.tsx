import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  getStatusColor,
  getStatusLabel,
} from "@/features/employee/helpers/helpers";
import type { TaskStatus } from "@/features/employee/types/types";

type StatusChipProps = {
  status: TaskStatus;
  /** Overrides the label derived from `status` — e.g. showing a real backend status name. */
  label?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const ICONS: Record<TaskStatus, keyof typeof Ionicons.glyphMap> = {
  todo: "ellipse-outline",
  in_progress: "play-circle-outline",
  review: "eye-outline",
  done: "checkmark-circle",
  cancelled: "close-circle-outline",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatusChip({
  status,
  label,
  selected = false,
  onPress,
  disabled,
}: StatusChipProps) {
  const scale = useSharedValue(1);
  const color = getStatusColor(status);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        animatedStyle,
        {
          borderRadius: 999,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? color : "#E5E7EB",
          backgroundColor: selected ? `${color}18` : "#F9FAFB",
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          ...(selected
            ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 3,
              }
            : {}),
        },
      ]}
    >
      <View
        className="mr-3 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: selected ? color : "#FFFFFF" }}
      >
        <Ionicons
          name={ICONS[status]}
          size={16}
          color={selected ? "#FFFFFF" : color}
        />
      </View>

      <Text
        className="flex-1 text-[14px] font-bold tracking-wide"
        style={{ color: selected ? color : "#374151" }}
      >
        {label ?? getStatusLabel(status)}
      </Text>

      {selected ? (
        <Ionicons name="checkmark-circle" size={20} color={color} />
      ) : null}
    </AnimatedPressable>
  );
}
