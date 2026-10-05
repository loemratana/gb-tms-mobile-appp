import { Pressable, Text } from "react-native";

import type { TabIconConfig } from "@/features/components/navigation/tabIcons";
import { colors } from "@/styles";

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = colors.textMuted;
const ICON_SIZE = 26;

type TabButtonProps = {
  config: TabIconConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabButton({ config, isFocused, onPress, onLongPress }: TabButtonProps) {
  const Icon = config.icon;
  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={config.label}
      className="flex-1 items-center justify-center gap-1 py-2"
    >
      <Icon size={ICON_SIZE} color={color} strokeWidth={isFocused ? 2.4 : 2} />
      <Text
        numberOfLines={1}
        className="text-center text-[11px]"
        style={{ color, fontWeight: isFocused ? "600" : "500" }}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}
