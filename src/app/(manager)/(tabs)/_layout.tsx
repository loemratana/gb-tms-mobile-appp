import { Tabs } from "expo-router/js-tabs";

import { ModernTabBar } from "@/features/components/navigation/ModernTabBar";
import { MANAGER_TAB_ICONS } from "@/features/components/navigation/tabIcons";

export default function ManagerTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ModernTabBar {...props} tabIcons={MANAGER_TAB_ICONS} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="team" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
