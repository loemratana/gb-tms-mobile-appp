import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { Task } from "@/features/tasks/types/taskView.types";
import {
  formatDate,
  getPriorityLabel,
  getStatusLabel,
  isTaskOverdue,
} from "@/features/tasks/utils/task.utils";
import { colors, priorityTone, taskStatusTone, toneColors } from "@/styles";

type TaskRowProps = {
  task: Task;
  onPress?: (task: Task) => void;
  /** Hairline above the row; off for the first row of a group. */
  hasDivider?: boolean;
};

/** Compact task line for grouped lists: status dot, title, due date + priority, assignee. */
export const TaskRow = memo(function TaskRow({ task, onPress, hasDivider = false }: TaskRowProps) {
  const statusColor = toneColors[taskStatusTone[task.status]].color;
  const priorityColor = toneColors[priorityTone[task.priority]].color;
  const isOverdue = isTaskOverdue(task);
  const isDone = task.status === "done";
  const assignee = task.assignees?.[0];

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${getStatusLabel(task.status)}, due ${formatDate(task.dueDate)}${isOverdue ? ", overdue" : ""}`}
      className="min-h-[56px] flex-row items-center gap-3 px-4 py-3 active:bg-field"
    >
      {hasDivider ? <View className="absolute left-4 right-0 top-0 h-px bg-line-soft" /> : null}

      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColor }} />

      <View className="min-w-0 flex-1">
        <Text
          className={`text-body font-semibold ${isDone ? "text-fg-soft line-through" : "text-fg"}`}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <Ionicons
            name={isOverdue ? "alert-circle-outline" : "calendar-outline"}
            size={12}
            color={isOverdue ? colors.danger : colors.textSubtle}
          />
          <Text className={`text-label ${isOverdue ? "font-semibold text-error" : "text-fg-soft"}`}>
            {isOverdue ? "Overdue · " : ""}
            {formatDate(task.dueDate)}
          </Text>
          <Text className="text-label text-fg-faint">·</Text>
          <Ionicons name="flag" size={11} color={priorityColor} />
          <Text className="text-label text-fg-soft">{getPriorityLabel(task.priority)}</Text>
        </View>
      </View>

      {assignee ? <Avatar name={assignee.name} imageUrl={assignee.avatarUrl} size={28} /> : null}
    </Pressable>
  );
});
