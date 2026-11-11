import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder shaped like a row of {@link CalendarEventCard}s. */
export function CalendarAgendaSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="mb-3 flex-row items-center gap-3 rounded-xl border border-line bg-surface py-3 pl-4 pr-3"
        >
          <View className="flex-1 gap-2">
            <View className="flex-row gap-1.5">
              <SkeletonBlock width={72} height={18} radius={999} />
              <SkeletonBlock width={56} height={18} radius={999} />
            </View>
            <SkeletonBlock height={15} className="w-4/5" />
            <SkeletonBlock height={12} className="w-1/2" />
          </View>
          <View className="w-16 items-center gap-1.5">
            <SkeletonCircle size={48} />
            <SkeletonBlock width={40} height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}
