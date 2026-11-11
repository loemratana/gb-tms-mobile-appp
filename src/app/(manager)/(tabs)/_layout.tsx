import { Tabs } from "expo-router/js-tabs";

import { ModernTabBar } from "@/components/navigation/ModernTabBar";
import { MANAGER_TAB_ICONS } from "@/components/navigation/tabIcons";

export default function ManagerTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ModernTabBar {...props} tabIcons={MANAGER_TAB_ICONS} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="meetings" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
