import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";
import { colors } from "@/styles";

/** Loading placeholder shaped like TaskCard — design system's "Skeleton Loader" component. */
export function TaskCardSkeleton() {
  return (
    <View className="mb-3 w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <View className="flex-row items-start gap-2.5">
        <SkeletonBlock
          width={8}
          height={8}
          radius={4}
          backgroundColor={colors.border}
          className="mt-1.5"
        />
        <SkeletonBlock height={16} radius={4} backgroundColor={colors.border} className="flex-1" />
      </View>
      <SkeletonBlock height={12} radius={4} className="ml-4.5 mt-2 w-2/3" />
      <SkeletonBlock height={12} radius={4} className="ml-4.5 mt-3 w-1/3" />
      <SkeletonBlock height={4} radius={999} className="ml-4.5 mt-3 w-full" />
    </View>
  );
}

/** A column of {@link TaskCardSkeleton} placeholders for a list's initial load. */
export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="px-4 pt-1">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </View>
  );
}
