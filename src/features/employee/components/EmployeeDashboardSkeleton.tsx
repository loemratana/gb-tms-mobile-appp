import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";

function KpiTileSkeleton() {
  return (
    <View className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <SkeletonBlock width={36} height={36} radius={12} />
      <SkeletonBlock height={26} className="mt-3 w-1/2" />
      <SkeletonBlock height={12} className="mt-1.5 w-3/4" />
      <SkeletonBlock height={11} className="mt-1 w-2/3" />
    </View>
  );
}

function TaskCardSkeleton() {
  return (
    <View className="mr-3 w-72 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-center gap-1.5">
        <SkeletonBlock width={6} height={6} radius={3} />
        <SkeletonBlock height={10} className="w-1/3" />
      </View>
      <SkeletonBlock height={16} className="mt-2 w-4/5" />
      <SkeletonBlock height={4} radius={999} className="mt-4 w-full" />
      <View className="mt-3 flex-row items-center justify-between">
        <SkeletonBlock width={70} height={28} radius={14} />
        <SkeletonBlock height={11} className="w-1/3" />
      </View>
    </View>
  );
}

/** Loading placeholder shaped like {@link EmployeeDashboardScreen}'s KPI grid + today's tasks row. */
export function EmployeeDashboardSkeleton() {
  return (
    <View className="gap-6">
      <View>
        <View className="mb-3 gap-1.5">
          <SkeletonBlock height={11} className="w-1/4" />
          <SkeletonBlock height={16} className="w-1/2" />
        </View>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <KpiTileSkeleton />
            <KpiTileSkeleton />
          </View>
          <View className="flex-row gap-3">
            <KpiTileSkeleton />
            <KpiTileSkeleton />
          </View>
        </View>
      </View>

      <View>
        <View className="mb-3 gap-1.5">
          <SkeletonBlock height={11} className="w-1/4" />
          <SkeletonBlock height={16} className="w-1/3" />
        </View>
        <View className="flex-row">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </View>
      </View>
    </View>
  );
}
