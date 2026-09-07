import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like a row of {@link CalendarEventCard}s. */
export function CalendarAgendaSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="mb-3 flex-row items-start gap-3 rounded-2xl bg-white p-4"
        >
          <SkeletonBlock width={10} height={10} radius={5} className="mt-1.5" />
          <View className="flex-1 gap-2">
            <View className="flex-row items-start justify-between gap-2">
              <SkeletonBlock height={16} className="flex-1" />
              <SkeletonBlock width={56} height={20} radius={999} />
            </View>
            <View className="flex-row items-center gap-2">
              <SkeletonCircle size={24} />
              <SkeletonBlock height={11} className="w-1/3" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
