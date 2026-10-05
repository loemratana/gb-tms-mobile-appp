import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";

/**
 * Loading placeholder shaped like a task detail screen — hero card, people row,
 * and an activity timeline. Shared by the employee and manager task detail screens,
 * which both render this body under the same `TaskDetailHeader`.
 */
export function TaskDetailSkeleton() {
  return (
    <View className="px-4 pt-4">
      <View>
        <View className="flex-row items-center gap-2">
          <SkeletonBlock width={8} height={8} radius={4} />
          <SkeletonBlock height={11} className="w-1/4" />
        </View>
        <SkeletonBlock height={22} className="mt-3 w-4/5" />
        <SkeletonBlock height={14} className="mt-2 w-full" />
        <SkeletonBlock height={14} className="mt-1.5 w-2/3" />
        <View className="mt-4 flex-row gap-4">
          <SkeletonBlock height={13} className="w-1/3" />
          <SkeletonBlock height={13} className="w-1/4" />
        </View>
        <SkeletonBlock height={6} radius={999} className="mt-4 w-full" />
      </View>

      <View className="mt-6 flex-row items-center border-t border-[#F3F4F6] pt-6">
        <View className="flex-1 flex-row items-center gap-2.5">
          <SkeletonCircle size={44} />
          <View className="flex-1 gap-1.5">
            <SkeletonBlock height={10} className="w-1/2" />
            <SkeletonBlock height={12} className="w-3/4" />
          </View>
        </View>
        <View className="mx-2 h-9 w-9" />
        <View className="flex-1 items-end gap-1.5">
          <SkeletonBlock height={10} className="w-1/2" />
          <SkeletonBlock height={12} className="w-3/4" />
        </View>
      </View>

      <View className="mt-6 border-t border-[#F3F4F6] pt-6">
        {[0, 1, 2].map((row) => (
          <View key={row} className="flex-row items-start gap-3 py-3.5">
            <SkeletonCircle size={36} />
            <View className="flex-1 gap-1.5 pt-1">
              <SkeletonBlock height={13} className="w-3/4" />
              <SkeletonBlock height={11} className="w-1/3" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
