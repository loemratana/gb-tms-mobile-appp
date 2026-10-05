import { View } from "react-native";

import { SkeletonBlock } from "@/features/components/ui/Skeleton";

/** Loading placeholder shaped like a {@link ProjectTaskRow}. */
function ProjectTaskRowSkeleton() {
  return (
    <View className="flex-row items-start rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3">
      <SkeletonBlock width={10} height={10} radius={5} className="mt-1" />
      <View className="ml-3 flex-1 gap-1.5">
        <SkeletonBlock height={14} className="w-2/3" />
        <SkeletonBlock height={11} className="w-1/2" />
      </View>
    </View>
  );
}

/** A column of {@link ProjectTaskRowSkeleton} placeholders for a project's task list. */
export function ProjectTaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <ProjectTaskRowSkeleton key={index} />
      ))}
    </View>
  );
}
