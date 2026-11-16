import { Tabs } from "expo-router/js-tabs";

import { ModernTabBar } from "@/components/navigation/ModernTabBar";
import { MANAGER_TAB_ICONS } from "@/components/navigation/tabIcons";
import { usePendingReviewCount } from "@/features/tasks/hooks/usePendingReviewCount";

export default function ManagerTabsLayout() {
  // Work waiting for review is flagged on the Dashboard tab, where its call to action lives.
  const { count: pendingReviewCount } = usePendingReviewCount();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <ModernTabBar
          {...props}
          tabIcons={MANAGER_TAB_ICONS}
          badgeCounts={{ dashboard: pendingReviewCount }}
        />
      )}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="meetings" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
