import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";

/** Loading placeholder for a single {@link TeamMemberCard} row. */
function TeamMemberCardSkeleton() {
  return (
    <View className="mb-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-center">
        <SkeletonCircle size={48} className="mr-3" />
        <View className="min-w-0 flex-1 gap-1.5">
          <SkeletonBlock height={15} className="w-1/2" />
          <SkeletonBlock height={12} className="w-1/3" />
          <SkeletonBlock height={11} className="w-2/3" />
        </View>
      </View>
    </View>
  );
}

/** A column of {@link TeamMemberCardSkeleton} placeholders for the roster's initial load. */
export function TeamListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <TeamMemberCardSkeleton key={index} />
      ))}
    </View>
  );
}
