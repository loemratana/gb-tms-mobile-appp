import { View } from "react-native";

import { SkeletonBlock } from "@/components/ui/Skeleton";

export function MeetingTimelineSkeleton() {
  return (
    <View className="gap-4 pt-2" accessibilityLabel="Loading meetings">
      {[0, 1, 2].map((row) => (
        <View key={row} className="flex-row gap-3">
          <SkeletonBlock width={40} height={12} />
          <View className="flex-1 gap-2 rounded-2xl border border-line p-3">
            <SkeletonBlock width="60%" height={14} />
            <SkeletonBlock width="40%" height={10} />
            <SkeletonBlock width="30%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}
