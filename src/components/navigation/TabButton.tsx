import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

import type { TabIconConfig } from "./tabIcons";

const ICON_SIZE = 22;

type TabButtonProps = {
  config: TabIconConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabButton({
  config,
  isFocused,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const activeColor = colors.primary;
  const inactiveColor = colors.textMuted;
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      className="flex-1 items-center justify-center py-2"
    >
      {({ pressed }) => (
        <View
          className="items-center justify-center gap-1"
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <Ionicons
            name={isFocused ? config.activeIcon : config.icon}
            size={ICON_SIZE}
            color={color}
          />
          <Text
            numberOfLines={1}
            className="text-center text-[11px]"
            style={{
              color,
              fontWeight: isFocused ? "600" : "500",
            }}
          >
            {config.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
