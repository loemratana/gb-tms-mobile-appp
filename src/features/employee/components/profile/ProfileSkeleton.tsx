import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like {@link ProfileHeroCard} plus a couple of section cards below it. */
export function ProfileSkeleton() {
  return (
    <View>
      <View className="items-center bg-white px-5 pb-5 pt-2">
        <SkeletonCircle size={96} />
        <SkeletonBlock height={20} className="mt-4 w-1/2" />
        <SkeletonBlock height={13} className="mt-2 w-1/3" />
        <SkeletonBlock height={12} className="mt-1.5 w-1/4" />

        <View className="mt-6 w-full flex-row items-stretch justify-between rounded-2xl bg-[#F3F4F6] px-2 py-4">
          {[0, 1, 2].map((index) => (
            <View key={index} className="flex-1 items-center gap-2 px-1">
              <SkeletonBlock width={32} height={32} radius={12} />
              <SkeletonBlock height={14} className="w-1/2" />
            </View>
          ))}
        </View>
      </View>

      <View className="gap-6 bg-[#F3F4F6] px-5 pb-8 pt-6">
        {[0, 1, 2].map((index) => (
          <View key={index} className="gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <SkeletonBlock height={13} className="w-1/3" />
            <SkeletonBlock height={11} className="w-full" />
            <SkeletonBlock height={11} className="w-2/3" />
          </View>
        ))}
      </View>
    </View>
  );
}
