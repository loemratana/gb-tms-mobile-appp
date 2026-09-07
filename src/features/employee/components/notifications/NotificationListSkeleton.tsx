import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like a column of {@link NotificationItem} cards. */
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-3 rounded-2xl bg-white p-4">
          <View className="flex-row gap-3">
            <SkeletonBlock width={40} height={40} radius={12} />
            <View className="min-w-0 flex-1 gap-2">
              <View className="flex-row items-center gap-2">
                <SkeletonBlock width={32} height={32} radius={16} />
                <SkeletonBlock height={13} className="flex-1" />
              </View>
              <SkeletonBlock height={11} className="w-3/4" />
              <SkeletonBlock height={11} className="w-1/3" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
