import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like the analytics body — KPI grid, donut, and bar chart. */
export function ManagerAnalyticsSkeleton() {
  return (
    <View className="gap-4">
      <View className="gap-3">
        {[0, 1].map((row) => (
          <View key={row} className="flex-row gap-3">
            {[0, 1].map((col) => (
              <View
                key={col}
                className="flex-1 gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <SkeletonBlock width={28} height={28} radius={14} />
                <SkeletonBlock height={18} className="w-1/2" />
                <SkeletonBlock height={11} className="w-2/3" />
              </View>
            ))}
          </View>
        ))}
      </View>

      <View className="items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <SkeletonCircle size={120} />
        <SkeletonBlock height={12} className="w-1/3" />
      </View>

      <View className="flex-row items-end justify-between gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {[60, 100, 75, 45, 90].map((barHeight, index) => (
          <SkeletonBlock key={index} width={28} height={barHeight} radius={8} />
        ))}
      </View>
    </View>
  );
}
