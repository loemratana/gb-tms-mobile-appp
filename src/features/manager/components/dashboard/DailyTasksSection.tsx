import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { Task } from "@/features/employee/types/types";
import { DailyTaskCard } from "@/features/manager/components/dashboard/DailyTaskCard";
import { selectDailyTasks } from "@/features/manager/utils/dailyTasks";

type DailyTasksSectionProps = {
  /** Full set of tasks this manager assigned (used to resolve subtasks too). */
  tasks: Task[];
  onSeeAll?: () => void;
  onTaskPress?: (task: Task) => void;
};

export function DailyTasksSection({
  tasks: allTasks,
  onSeeAll,
  onTaskPress,
}: DailyTasksSectionProps) {
  const router = useRouter();

  const tasks = useMemo(() => selectDailyTasks(allTasks), [allTasks]);

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }
    router.push("/(manager)/(tabs)/tasks");
  };

  const handleTaskPress = (task: Task) => {
    if (onTaskPress) {
      onTaskPress(task);
      return;
    }
    router.push({
      pathname: "/(manager)/tasks/[id]",
      params: { id: task.id },
    });
  };

  return (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
            Daily Tasks
          </Text>
          <Text className="mt-1 text-[18px] font-bold tracking-tight text-[#111827]">
            Today&apos;s workload
          </Text>
          <Text className="mt-0.5 text-[12px] text-[#6B7280]">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} need attention
          </Text>
        </View>

        <Pressable
          onPress={handleSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all daily tasks"
        >
          <Text className="text-[14px] font-semibold text-[#2563EB]">See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 4 }}
      >
        {tasks.map((task) => (
          <DailyTaskCard
            key={task.id}
            task={task}
            allTasks={allTasks}
            onPress={handleTaskPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}
