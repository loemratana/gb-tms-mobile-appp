import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabButton } from "@/features/components/navigation/TabButton";
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_RADIUS,
} from "@/features/components/navigation/constants";
import type { TabSfIconConfig } from "@/features/components/navigation/tabIcons";
import { applyShadow, colors, shadows } from "@/styles";

const OUTER_HORIZONTAL_PADDING = 16;
const HORIZONTAL_PADDING = 12;

type ModernTabBarProps = BottomTabBarProps & {
  tabIcons: Record<string, TabSfIconConfig>;
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

  const renderTab = (route: (typeof routes)[number]) => {
    const routeIndex = state.routes.findIndex((item) => item.key === route.key);

    const isFocused = state.index === routeIndex;
    const config = tabIcons[route.name];

    return (
      <View key={route.key} className="flex-1 items-center justify-center">
        <TabButton
          config={config}
          isFocused={isFocused}
          onPress={() => handleTabPress(route.key, route.name, isFocused)}
          onLongPress={() => handleTabLongPress(route.key)}
        />
      </View>
    );
  };

  return (
    <View
      className="bg-transparent"
      style={{
        paddingHorizontal: OUTER_HORIZONTAL_PADDING,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 8,
      }}
    >
      <View
        className="flex-row items-center"
        style={{
          height: TAB_BAR_HEIGHT,
          borderRadius: TAB_BAR_RADIUS,
          backgroundColor: colors.card,
          paddingHorizontal: HORIZONTAL_PADDING,
          ...applyShadow(shadows.xl),
        }}
      >
        {routes.map(renderTab)}
      </View>
    </View>
  );
}

export function useFloatingTabBarInset() {
  const insets = useSafeAreaInsets();

  return insets.bottom + TAB_BAR_HEIGHT + 12;
}
