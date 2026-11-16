import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

import type { TabIconConfig } from "./tabIcons";

const ICON_SIZE = 22;
/** Above this the badge shows "9+" so it stays a small circle. */
const MAX_BADGE_COUNT = 9;

type TabButtonProps = {
  config: TabIconConfig;
  isFocused: boolean;
  badgeCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabButton({
  config,
  isFocused,
  badgeCount = 0,
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
      accessibilityLabel={badgeCount > 0 ? `${config.label}, ${badgeCount} waiting` : config.label}
      className="flex-1 items-center justify-center py-2"
    >
      {({ pressed }) => (
        <View
          className="items-center justify-center gap-1"
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <View>
            <Ionicons
              name={isFocused ? config.activeIcon : config.icon}
              size={ICON_SIZE}
              color={color}
            />
            {badgeCount > 0 ? (
              <View className="absolute -right-2.5 -top-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-error px-1">
                <Text className="text-micro font-bold text-white">
                  {badgeCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : badgeCount}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            numberOfLines={1}
            className="text-center font-sans text-[11px]"
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
