import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

const DETAIL_ROWS = [0, 1, 2, 3, 4];

/**
 * Loading placeholder shaped like the task detail body — status/priority badges,
 * title, Details card of property rows, and an activity list. Rendered under
 * `TaskDetailHeader` so the layout doesn't jump when the task arrives.
 */
export function TaskDetailSkeleton() {
  return (
    <View className="px-4 pt-4">
      <View>
        <View className="mb-3 flex-row items-center gap-2">
          <SkeletonBlock width={84} height={24} radius={999} />
          <SkeletonBlock width={104} height={24} radius={999} />
        </View>
        <SkeletonBlock height={24} className="w-4/5" />
        <SkeletonBlock height={14} className="mt-3 w-full" />
        <SkeletonBlock height={14} className="mt-1.5 w-2/3" />
      </View>

      <View className="mt-6">
        <SkeletonBlock height={14} className="mb-3 w-1/4" />
        <View className="rounded-2xl border border-line px-4 py-1">
          {DETAIL_ROWS.map((row) => (
            <View
              key={row}
              className={`min-h-[48px] flex-row items-center gap-3 py-2.5 ${row > 0 ? "border-t border-line-soft" : ""}`}
            >
              <SkeletonBlock width={18} height={18} radius={6} />
              <SkeletonBlock height={12} className="w-20" />
              <View className="flex-1 items-end">
                <SkeletonBlock height={13} className="w-1/2" />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <SkeletonBlock height={14} className="mb-1 w-1/4" />
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
