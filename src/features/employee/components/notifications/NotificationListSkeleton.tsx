import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";
import { colors } from "@/styles";

/** Loading placeholder shaped like a column of {@link NotificationItem} cards. */
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="flex-row items-center gap-3 border-b py-4"
          style={{ borderColor: colors.border }}
        >
          <SkeletonBlock width={64} height={64} radius={32} />
          <View className="min-w-0 flex-1 gap-2">
            <SkeletonBlock height={13} className="w-1/2" />
            <SkeletonBlock height={11} className="w-3/4" />
            <SkeletonBlock height={11} className="w-1/3" />
          </View>
        </View>
      ))}
    </View>
  );
}
