import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";

/** Loading placeholder shaped like the profile identity block and the details list. */
export function ProfileSkeleton() {
  return (
    <View className="gap-6 pt-5">
      <View className="gap-4 px-4">
        <View className="flex-row items-center gap-4">
          <SkeletonCircle size={72} />
          <View className="flex-1 gap-2">
            <SkeletonBlock height={22} className="w-2/3" />
            <SkeletonBlock width={72} height={22} radius={999} />
          </View>
        </View>
        <SkeletonBlock height={36} radius={12} className="w-full" />
      </View>

      <View className="gap-1">
        <View className="mb-1 px-4">
          <SkeletonBlock height={12} className="w-1/4" />
        </View>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} className="min-h-[56px] flex-row items-center gap-3 px-4 py-2.5">
            <SkeletonBlock width={36} height={36} radius={8} />
            <View className="flex-1 gap-1.5">
              <SkeletonBlock height={14} className="w-1/4" />
              <SkeletonBlock height={12} className="w-1/2" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
