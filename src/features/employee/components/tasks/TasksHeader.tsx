import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, pressScale } from "@/styles";

type TasksHeaderProps = {
  filterActive?: boolean;
  onPressSearch?: () => void;
  onPressFilter?: () => void;
};

type HeaderIconButtonProps = Pick<PressableProps, "onPress"> & {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
};

/** Icon-only header button with press-scale feedback — one clear active-state signal (tint + icon color). */
function HeaderIconButton({ icon, label, active = false, onPress }: HeaderIconButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(pressScale, { damping: 18, stiffness: 320 });
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  }, [scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: active ? "rgba(37, 99, 235, 0.1)" : colors.mutedBg }}
      >
        <Ionicons name={icon} size={20} color={active ? colors.primary : colors.text} />
      </Pressable>
    </Animated.View>
  );
}

export function TasksHeader({
  filterActive = false,
  onPressSearch,
  onPressFilter,
}: TasksHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center justify-between px-5 py-2">
        <Text className="text-[22px] font-bold tracking-tight text-[#111827]">
          Tasks
        </Text>

        <View className="flex-row items-center gap-2">
          <HeaderIconButton
            icon="search-outline"
            label="Search tasks"
            onPress={onPressSearch}
          />
          <HeaderIconButton
            icon="options-outline"
            label="Filter tasks"
            active={filterActive}
            onPress={onPressFilter}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
