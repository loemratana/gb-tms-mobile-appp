import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder for a single {@link TeamMemberRow}. */
function TeamMemberRowSkeleton({ hasDivider }: { hasDivider: boolean }) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      {hasDivider ? <View className="absolute left-[72px] right-0 top-0 h-px bg-line-soft" /> : null}
      <SkeletonCircle size={44} />
      <View className="min-w-0 flex-1 gap-1.5">
        <SkeletonBlock height={14} className="w-1/2" />
        <SkeletonBlock height={12} className="w-1/3" />
        <SkeletonBlock height={12} className="w-2/5" />
      </View>
    </View>
  );
}

/** Team summary + roster placeholders for the initial load. */
export function TeamListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-5">
      <View className="mx-4 rounded-2xl border border-line bg-surface p-4">
        <View className="flex-row items-center gap-3">
          <SkeletonBlock width={40} height={40} radius={12} />
          <View className="flex-1 gap-1.5">
            <SkeletonBlock height={10} className="w-1/4" />
            <SkeletonBlock height={16} className="w-1/2" />
          </View>
        </View>
        <View className="mt-3.5 flex-row items-center justify-between rounded-xl border border-line-soft bg-field px-3.5 py-2.5">
          <SkeletonBlock height={16} className="w-1/3" />
          <SkeletonBlock height={16} className="w-1/3" />
        </View>
      </View>

      <View>
        <View className="mb-2 px-4">
          <SkeletonBlock height={16} className="w-1/3" />
        </View>
        <View className="bg-surface">
          {Array.from({ length: count }).map((_, index) => (
            <TeamMemberRowSkeleton key={index} hasDivider={index > 0} />
          ))}
        </View>
      </View>
    </View>
  );
}
