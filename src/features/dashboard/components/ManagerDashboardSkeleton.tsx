import { View } from "react-native";

import { StatCardSkeleton } from "@/components/ui/StatCard";
import { SkeletonBlock } from "@/components/ui/Skeleton";

function ChartCardSkeleton() {
  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <SkeletonBlock height={12} className="w-1/3" />
        <SkeletonBlock width={88} height={24} radius={8} />
      </View>
      <SkeletonBlock height={180} radius={12} className="mt-4 w-full" />
    </View>
  );
}

/** Loading placeholder shaped like {@link ManagerDashboardScreen}'s status stat cards + monthly chart. */
export function ManagerDashboardSkeleton() {
  return (
    <View className="gap-6">
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
      <ChartCardSkeleton />
    </View>
  );
}
