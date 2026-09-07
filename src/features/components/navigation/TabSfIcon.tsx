import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolView } from "expo-symbols";
import { Platform } from "react-native";

import {
  resolveAndroidIcon,
  resolveSfSymbol,
  type TabSfIconConfig,
} from "@/features/components/navigation/tabIcons";

type TabSfIconProps = {
  config: TabSfIconConfig;
  isFocused: boolean;
  size?: number;
  color: string;
};

export function TabSfIcon({
  config,
  isFocused,
  size = 22,
  color,
}: TabSfIconProps) {
  const androidIconName = resolveAndroidIcon(config.android, isFocused);

  if (Platform.OS !== "ios") {
    return (
      <MaterialCommunityIcons
        name={androidIconName as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
      />
    );
  }

  return (
    <SymbolView
      name={resolveSfSymbol(config.sf, isFocused)}
      size={size}
      tintColor={color}
      weight={isFocused ? "semibold" : "regular"}
      resizeMode="scaleAspectFit"
      fallback={
        <MaterialCommunityIcons
          name={androidIconName as keyof typeof MaterialCommunityIcons.glyphMap}
          size={size}
          color={color}
        />
      }
    />
  );
}
