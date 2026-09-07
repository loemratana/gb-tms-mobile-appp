import { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { TabSfIcon } from "@/features/components/navigation/TabSfIcon";
import type { TabSfIconConfig } from "@/features/components/navigation/tabIcons";

const ACTIVE_COLOR = "#32CD32";
const INACTIVE_COLOR = "#6B7280";

const springConfig = { damping: 16, stiffness: 260, mass: 0.45 };

const CIRCLE_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  android: { elevation: 6 },
});

type CircleTabButtonProps = {
  config: TabSfIconConfig;
  isFocused: boolean;
  onPress: () => void;
};

export function CircleTabButton({
  config,
  isFocused,
  onPress,
}: CircleTabButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.06 : 1, springConfig);
  }, [isFocused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      className="items-center"
    >
      <Animated.View style={[animatedStyle, CIRCLE_SHADOW]}>
        <View
          className="h-[52px] w-[52px] overflow-hidden rounded-full border-2"
          style={{
            borderColor: isFocused ? ACTIVE_COLOR : "rgba(255,255,255,0.8)",
          }}
        >
          <BlurView
            intensity={Platform.OS === "ios" ? 64 : 40}
            tint="light"
            className="flex-1 items-center justify-center bg-white/85"
          >
            <TabSfIcon
              config={config}
              isFocused={isFocused}
              size={22}
              color={iconColor}
            />
          </BlurView>
        </View>
      </Animated.View>

      <Text
        numberOfLines={1}
        className="mt-1.5 text-[10px] font-semibold"
        style={{ color: isFocused ? ACTIVE_COLOR : "#9CA3AF" }}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}
