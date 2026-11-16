import { View } from "react-native";

import { StatCardSkeleton } from "@/components/ui/StatCard";

/** Loading placeholder shaped like {@link ManagerDashboardScreen}'s status stat cards. */
export function ManagerDashboardSkeleton() {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
      <View className="flex-row gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
    </View>
  );
}
