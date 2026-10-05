import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like a column of {@link CalendarTaskCard}s. */
export function TaskListByDateSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="mt-4 px-4">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-3 flex-row rounded-2xl bg-white p-4">
          <View className="mr-4 w-14 items-center justify-center gap-1.5">
            <SkeletonBlock height={10} className="w-2/3" />
            <SkeletonBlock height={20} className="w-full" />
          </View>
          <View className="mr-4 w-px self-stretch bg-[#E5E7EB]" />
          <View className="flex-1 gap-2">
            <View className="flex-row items-start justify-between gap-2">
              <SkeletonBlock height={16} className="flex-1" />
              <SkeletonBlock width={56} height={20} radius={999} />
            </View>
            <SkeletonBlock height={11} className="w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
}
