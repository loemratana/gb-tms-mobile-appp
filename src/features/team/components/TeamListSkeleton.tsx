import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder for a single {@link TeamMemberCard} card. */
function TeamMemberCardSkeleton() {
  return (
    <View className="w-full flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
      <SkeletonCircle size={44} />
      <View className="min-w-0 flex-1 gap-1.5">
        <SkeletonBlock height={14} className="w-1/2" />
        <SkeletonBlock height={12} className="w-2/3" />
      </View>
      <SkeletonBlock width={36} height={36} radius={12} />
      <SkeletonBlock width={36} height={36} radius={12} />
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
        <View className="gap-2.5 px-4">
          {Array.from({ length: count }).map((_, index) => (
            <TeamMemberCardSkeleton key={index} />
          ))}
        </View>
      </View>
    </View>
  );
}
