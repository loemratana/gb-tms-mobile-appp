import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useCallback, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { shadows } from "@/styles";

import { TabButton } from "./TabButton";
import {
  TAB_BAR_BOTTOM_GAP,
  TAB_BAR_HEIGHT,
  TAB_BAR_HORIZONTAL_INSET,
} from "./constants";
import type { TabIconConfig } from "./tabIcons";

type ModernTabBarProps = BottomTabBarProps & {
  tabIcons: Record<string, TabIconConfig>;
  navigation?: {
    emit?: (event: { type: string; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate?: (name: string) => void;
  };
};

export function ModernTabBar({
  state,
  emitter,
  navigateToTab,
  navigation,
  tabIcons,
}: ModernTabBarProps) {
  const insets = useSafeAreaInsets();

  const routes = useMemo(
    () => state.routes.filter((route) => tabIcons[route.name]),
    [state.routes, tabIcons],
  );

  const bottomOffset = Math.max(insets.bottom, TAB_BAR_BOTTOM_GAP);

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      let defaultPrevented = false;

      if (emitter?.emit) {
        const event = emitter.emit({
          type: "tabPress",
          target: routeKey,
          canPreventDefault: true,
        });
        defaultPrevented = event.defaultPrevented;
      } else if (navigation?.emit) {
        const event = navigation.emit({
          type: "tabPress",
          target: routeKey,
          canPreventDefault: true,
        });
        defaultPrevented = event.defaultPrevented;
      }

      if (defaultPrevented || isFocused) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (navigateToTab) {
        navigateToTab(routeKey);
      } else if (navigation?.navigate) {
        navigation.navigate(routeName);
      }
    },
    [emitter, navigateToTab, navigation],
  );

  const handleTabLongPress = useCallback(
    (routeKey: string) => {
      if (emitter?.emit) {
        emitter.emit({
          type: "tabLongPress",
          target: routeKey,
        });
      } else if (navigation?.emit) {
        navigation.emit({
          type: "tabLongPress",
          target: routeKey,
        });
      }
    },
    [emitter, navigation],
  );

  if (routes.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          paddingHorizontal: TAB_BAR_HORIZONTAL_INSET,
          paddingBottom: bottomOffset,
        },
      ]}
    >
      <View
        className="flex-row items-center rounded-full border border-line bg-surface"
        style={styles.pill}
      >
        {routes.map((route) => {
          const routeIndex = state.routes.findIndex(
            (item) => item.key === route.key,
          );
          const isFocused = state.index === routeIndex;

          return (
            <TabButton
              key={route.key}
              config={tabIcons[route.name]}
              isFocused={isFocused}
              onPress={() =>
                handleTabPress(route.key, route.name, isFocused)
              }
              onLongPress={() => handleTabLongPress(route.key)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  pill: {
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: 32,
    ...Platform.select(shadows.md),
  },
});

export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();

  return (
    TAB_BAR_HEIGHT +
    Math.max(insets.bottom, TAB_BAR_BOTTOM_GAP) +
    8
  );
}
