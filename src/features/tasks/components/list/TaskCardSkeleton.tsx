import { View } from "react-native";

import { SkeletonBlock } from "@/components/ui/Skeleton";
import { colors } from "@/styles";

/** Loading placeholder shaped like TaskCard — design system's "Skeleton Loader" component. */
export function TaskCardSkeleton() {
  return (
    <View className="mb-3 w-full rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <SkeletonBlock width={84} height={22} radius={999} />
        <SkeletonBlock width={64} height={22} radius={999} />
      </View>
      <SkeletonBlock
        height={16}
        radius={4}
        backgroundColor={colors.border}
        className="mt-3.5 w-4/5"
      />
      <SkeletonBlock height={12} radius={4} className="mt-2 w-full" />
      <SkeletonBlock height={6} radius={999} className="mt-4 w-full" />
      <View className="mt-4 flex-row items-center justify-between border-t border-line-soft pt-3">
        <SkeletonBlock width={110} height={24} radius={8} />
        <SkeletonBlock width={28} height={28} radius={14} />
      </View>
    </View>
  );
}

/** A column of {@link TaskCardSkeleton} placeholders for a list's initial load. */
export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="pt-1">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </View>
  );
}
