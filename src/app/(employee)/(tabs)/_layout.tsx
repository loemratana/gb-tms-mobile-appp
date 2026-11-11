import { Tabs } from "expo-router/js-tabs";

import { ModernTabBar } from "@/components/navigation/ModernTabBar";
import { EMPLOYEE_TAB_ICONS } from "@/components/navigation/tabIcons";

export default function EmployeeTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ModernTabBar {...props} tabIcons={EMPLOYEE_TAB_ICONS} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="my-tasks" />
      <Tabs.Screen name="meetings" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
