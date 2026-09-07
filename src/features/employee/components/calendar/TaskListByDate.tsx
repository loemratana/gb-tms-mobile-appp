import { Text, View } from "react-native";

import {
  CategoryChips,
  type CategoryFilter,
} from "@/features/employee/components/calendar/CategoryChips";
import { CalendarTaskCard } from "@/features/employee/components/calendar/TaskCard";
import type { Task } from "@/features/employee/types/types";

type TaskListByDateProps = {
  dateLabel: string;
  tasks: Task[];
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onTaskPress?: (task: Task) => void;
};

export function TaskListByDate({
  dateLabel,
  tasks,
  category,
  onCategoryChange,
  onTaskPress,
}: TaskListByDateProps) {
  return (
    <View className="mt-5">
      <View className="mb-1 flex-row items-center justify-between px-4">
        <Text className="text-sm font-medium text-[#6B7280]">{dateLabel}</Text>
        <Text className="text-xs font-medium text-[#9CA3AF]">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Text>
      </View>

      <CategoryChips active={category} onChange={onCategoryChange} />

      <View className="mt-4 px-4">
        {tasks.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-4 py-10">
            <Text className="text-base font-bold text-[#111827]">
              No tasks assigned
            </Text>
            <Text className="mt-1 text-center text-xs text-gray-500">
              No tasks from your manager on this day
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <CalendarTaskCard
              key={task.id}
              task={task}
              onPress={onTaskPress}
            />
          ))
        )}
      </View>
    </View>
  );
}
