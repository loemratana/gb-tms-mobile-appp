import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabButton } from "@/features/components/navigation/TabButton";
import { TAB_BAR_HEIGHT } from "@/features/components/navigation/constants";
import type { TabIconConfig } from "@/features/components/navigation/tabIcons";
import { colors } from "@/styles";

type ModernTabBarProps = BottomTabBarProps & {
  tabIcons: Record<string, TabIconConfig>;
};

export function ModernTabBar({ state, navigation, tabIcons }: ModernTabBarProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) return;

      if (!isFocused) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  const handleTabLongPress = useCallback(
    (routeKey: string) => {
      navigation.emit({
        type: "tabLongPress",
        target: routeKey,
      });
    },
    [navigation],
  );

  const routes = state.routes.filter((route) => tabIcons[route.name]);

  return (
    <View
      className="flex-row border-t"
      style={{
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      }}
    >
      {routes.map((route) => {
        const routeIndex = state.routes.findIndex((item) => item.key === route.key);
        const isFocused = state.index === routeIndex;

        return (
          <TabButton
            key={route.key}
            config={tabIcons[route.name]}
            isFocused={isFocused}
            onPress={() => handleTabPress(route.key, route.name, isFocused)}
            onLongPress={() => handleTabLongPress(route.key)}
          />
        );
      })}
    </View>
  );
}

export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();

  return insets.bottom + TAB_BAR_HEIGHT;
}
