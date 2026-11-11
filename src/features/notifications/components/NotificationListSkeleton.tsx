import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder shaped like a column of {@link NotificationItem} rows. */
export function NotificationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="pt-3">
      <SkeletonBlock height={11} className="mx-5 mb-2 w-1/5" />
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="flex-row gap-3 px-5 py-3.5">
          <SkeletonCircle size={44} />
          <View className="min-w-0 flex-1 gap-2">
            <SkeletonBlock height={13} className="w-3/4" />
            <SkeletonBlock height={11} className="w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
}
