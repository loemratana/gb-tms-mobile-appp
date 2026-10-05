import { Calendar, ChevronRight, Flag } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import {
    formatDate,
    getPriorityLabel,
    getSubtaskCompletionProgress,
    getTaskDisplayProgress,
    resolveTaskSubtasks,
} from "@/features/employee/helpers/helpers";
import type { Task, TaskPriority } from "@/features/employee/types/types";
import { StatusBadge } from "@/features/manager/components/task/StatusBadge";
import { TaskSubtaskPreview } from "@/features/manager/components/task/TaskSubtaskPreview";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#32CD32",
  medium: "#F59E0B",
  high: "#EF4444",
  urgent: "#EF4444",
};

type DailyTaskCardProps = {
  task: Task;
  allTasks: Task[];
  onPress?: (task: Task) => void;
};

export function DailyTaskCard({ task, allTasks, onPress }: DailyTaskCardProps) {
  const subtasks = useMemo(
    () => resolveTaskSubtasks(allTasks, task),
    [allTasks, task],
  );
  const assignee = task.assignees[0];
  const progress =
    subtasks.length > 0
      ? getSubtaskCompletionProgress(subtasks)
      : getTaskDisplayProgress(task);
  const priorityColor = PRIORITY_COLORS[task.priority];
  const progressColor =
    task.status === "done"
      ? "#32CD32"
      : task.status === "review"
        ? "#F59E0B"
        : "#2563EB";

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={`Open task ${task.title}`}
      className="mr-3 w-[288px] rounded-2xl border border-[#E5E7EB] bg-white p-4"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className="flex-1 text-[15px] font-bold leading-5 text-[#111827]"
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View className="shrink-0">
          <StatusBadge status={task.status} />
        </View>
      </View>

      <TaskSubtaskPreview subtasks={subtasks} variant="compact" />

      {/* <View className="mt-3 flex-row items-center gap-3">
        {assignee?.avatarUrl ? (
          <Image
            source={{ uri: assignee.avatarUrl }}
            className="h-9 w-9 rounded-full bg-[#F3F4F6]"
          />
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Text className="text-[12px] font-bold text-[#6B7280]">
              {assignee?.name?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text className="text-[13px] font-semibold text-[#111827]" numberOfLines={1}>
            {assignee?.name ?? "Unassigned"}
          </Text>
          <Text className="text-[11px] text-[#6B7280]" numberOfLines={1}>
            {assignee?.role ?? task.team ?? "Assignee"}
          </Text>
        </View>
      </View> */}

      <View className="mt-3">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-[11px] font-medium text-[#6B7280]">
            Progress
          </Text>
          <Text className="text-[11px] font-bold text-[#111827]">
            {progress}%
          </Text>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          />
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#9CA3AF" strokeWidth={2.2} />
          <Text className="text-[11px] text-[#6B7280]">
            {formatDate(task.dueDate)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Flag size={13} color={priorityColor} strokeWidth={2.2} />
          <Text
            className="text-[11px] font-medium"
            style={{ color: priorityColor }}
          >
            {getPriorityLabel(task.priority)}
          </Text>
        </View>
        <View className="flex-row items-center gap-0.5">
          <Text className="text-[11px] font-semibold text-[#32CD32]">Open</Text>
          <ChevronRight size={14} color="#32CD32" strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}
