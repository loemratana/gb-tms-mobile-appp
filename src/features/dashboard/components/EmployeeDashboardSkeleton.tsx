import { View } from "react-native";

import { StatCardSkeleton } from "@/components/ui/StatCard";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

function TaskRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <SkeletonCircle size={10} />
      <View className="flex-1 gap-1.5">
        <SkeletonBlock height={14} className="w-3/4" />
        <SkeletonBlock height={11} className="w-1/2" />
      </View>
      <SkeletonCircle size={28} />
    </View>
  );
}

/** Loading placeholder shaped like {@link EmployeeDashboardScreen}: overview grid + My work list. */
export function EmployeeDashboardSkeleton() {
  return (
    <View className="gap-6">
      <View className="gap-3">
        <SkeletonBlock height={18} className="w-1/3" />
        <View className="flex-row gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
        <View className="flex-row gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
      </View>

      <View className="gap-3">
        <SkeletonBlock height={18} className="w-1/4" />
        <SkeletonBlock height={44} radius={12} className="w-full" />
        <View className="overflow-hidden rounded-2xl border border-line bg-surface">
          <TaskRowSkeleton />
          <TaskRowSkeleton />
          <TaskRowSkeleton />
        </View>
      </View>
    </View>
  );
}
