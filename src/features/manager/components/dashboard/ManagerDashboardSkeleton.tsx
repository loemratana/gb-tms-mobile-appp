import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";

function KpiTileSkeleton() {
  return (
    <View className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <SkeletonBlock width={32} height={32} radius={10} />
      <SkeletonBlock height={22} className="mt-3 w-1/2" />
      <SkeletonBlock height={11} className="mt-1.5 w-3/4" />
    </View>
  );
}

function DailyTaskCardSkeleton() {
  return (
    <View className="mr-3 w-[288px] rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-center justify-between gap-2">
        <SkeletonBlock height={16} className="flex-1" />
        <SkeletonBlock width={64} height={22} radius={999} />
      </View>
      <SkeletonBlock height={11} className="mt-3 w-2/3" />
      <SkeletonBlock height={6} radius={999} className="mt-3 w-full" />
      <View className="mt-3 flex-row items-center justify-between">
        <SkeletonBlock height={11} className="w-1/4" />
        <SkeletonBlock height={11} className="w-1/4" />
      </View>
    </View>
  );
}

/** Loading placeholder shaped like {@link ManagerDashboardScreen}'s KPI stack + daily tasks row. */
export function ManagerDashboardSkeleton() {
  return (
    <View className="gap-6">
      <View className="flex-row gap-3">
        <KpiTileSkeleton />
        <KpiTileSkeleton />
        <KpiTileSkeleton />
      </View>

      <View>
        <View className="mb-3 gap-1.5">
          <SkeletonBlock height={11} className="w-1/4" />
          <SkeletonBlock height={16} className="w-1/3" />
          <SkeletonBlock height={11} className="w-1/2" />
        </View>
        <View className="flex-row">
          <DailyTaskCardSkeleton />
          <DailyTaskCardSkeleton />
        </View>
      </View>
    </View>
  );
}
