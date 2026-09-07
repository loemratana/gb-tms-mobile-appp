import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import {
  formatDate,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getTaskDisplayProgress,
  isTaskOverdue,
} from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

export type { Task };

export type TodayTasksProps = {
  tasks: Task[];
  onSeeAll?: () => void;
  onTaskPress?: (task: Task) => void;
};

function DashboardTaskCard({
  task,
  onPress,
}: {
  task: Task;
  onPress?: (task: Task) => void;
}) {
  const statusColor = getStatusColor(task.status);
  const displayProgress = getTaskDisplayProgress(task);
  const progressColor = task.status === "done" ? "#32CD32" : "#F59E0B";
  const overdue = isTaskOverdue(task);
  const assignees = task.assignees ?? [];

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={task.title}
      className="mr-3 w-72 rounded-2xl border border-[#E5E7EB] bg-white p-4"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
        <Text
          className="text-[11px] font-bold tracking-wide"
          style={{ color: statusColor }}
        >
          {getStatusLabel(task.status)}
        </Text>
      </View>

      <Text className="mt-1.5 text-base font-bold text-[#111827]" numberOfLines={2}>
        {task.title}
      </Text>

      <View className="mt-3">
        <View className="h-1 overflow-hidden rounded-full bg-[#F3F4F6]">
          <View
            className="h-full rounded-full"
            style={{ width: `${displayProgress}%`, backgroundColor: progressColor }}
          />
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row -space-x-2">
          {assignees.slice(0, 3).map((person, idx) =>
            person.avatarUrl ? (
              <Image
                key={`${task.id}-${person.name}-${idx}`}
                source={{ uri: person.avatarUrl }}
                className="h-7 w-7 rounded-full border-2 border-white bg-[#E5E7EB]"
                style={{ marginLeft: idx > 0 ? -8 : 0 }}
              />
            ) : (
              <View
                key={`${task.id}-${person.name}-${idx}`}
                className="h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB]"
                style={{ marginLeft: idx > 0 ? -8 : 0 }}
              >
                <Ionicons name="person" size={11} color="#6B7280" />
              </View>
            )
          )}
          {assignees.length > 3 ? (
            <View
              className="h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB]"
              style={{ marginLeft: -8 }}
            >
              <Text className="text-[9px] font-bold text-[#6B7280]">
                +{assignees.length - 3}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center">
          <Ionicons
            name="time-outline"
            size={13}
            color={overdue ? "#EF4444" : "#9CA3AF"}
          />
          <Text
            className="ml-1 text-[11px] font-medium"
            style={{ color: overdue ? "#EF4444" : "#9CA3AF" }}
          >
            {formatDate(task.dueDate)} · {getPriorityLabel(task.priority)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function TodayTasks({ tasks, onSeeAll, onTaskPress }: TodayTasksProps) {
  return (
    <View className="w-full">
      <View className="mb-3 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
            Tasks
          </Text>
          <Text className="mt-1 text-[18px] font-bold tracking-tight text-[#111827]">
            Active right now
          </Text>
        </View>

        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See all tasks"
          >
            <Text className="text-[14px] font-semibold text-[#2563EB]">See all</Text>
          </Pressable>
        ) : null}
      </View>

      {tasks.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-4 py-8">
          <Ionicons name="checkmark-done-circle-outline" size={24} color="#9CA3AF" />
          <Text className="mt-2 text-[13px] font-medium text-[#6B7280]">
            You&apos;re all caught up
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {tasks.map((task) => (
            <DashboardTaskCard key={task.id} task={task} onPress={onTaskPress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
