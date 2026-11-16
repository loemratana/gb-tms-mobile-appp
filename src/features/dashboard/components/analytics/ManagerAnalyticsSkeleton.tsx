import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder shaped like the analytics report: KPI tiles, status bar, workload rows. */
export function ManagerAnalyticsSkeleton() {
  return (
    <View className="gap-7">
      <View className="gap-3">
        {[0, 1].map((row) => (
          <View key={row} className="flex-row gap-3">
            {[0, 1].map((column) => (
              <View key={column} className="flex-1 gap-2 rounded-2xl bg-field px-3.5 py-3">
                <SkeletonBlock height={12} className="w-1/2" />
                <SkeletonBlock height={24} className="w-1/3" />
                <SkeletonBlock height={11} className="w-2/3" />
              </View>
            ))}
          </View>
        ))}
      </View>

      <View className="gap-3">
        <SkeletonBlock height={16} className="w-2/5" />
        <SkeletonBlock height={12} radius={6} className="w-full" />
        {[0, 1, 2].map((row) => (
          <SkeletonBlock key={row} height={14} className="w-full" />
        ))}
      </View>

      <View className="gap-3">
        <SkeletonBlock height={16} className="w-1/3" />
        {[0, 1, 2].map((row) => (
          <View key={row} className="flex-row items-center gap-3">
            <SkeletonCircle size={36} />
            <View className="flex-1 gap-1.5">
              <SkeletonBlock height={13} className="w-1/2" />
              <SkeletonBlock height={6} radius={3} className="w-full" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
