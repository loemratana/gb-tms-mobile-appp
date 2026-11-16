import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  TASK_STATUS_LABELS,
  getTaskTone,
  isTaskOverdue,
} from "@/features/calendar/utils/calendarTasks";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { colors, priorityTone } from "@/styles";

type CalendarEventCardProps = {
  task: TaskResponse;
  onPress?: (task: TaskResponse) => void;
};

function priorityLabel(priority: TaskResponse["priority"]): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

/** The task's assignee as a large avatar with their first name, plus "+N" for collaborators. */
function AssigneeAvatar({ task }: { task: TaskResponse }) {
  const assignee = task.assignee;
  const extraCount = Math.max(0, (task.assignees?.length ?? 0) - 1);

  if (!assignee) {
    return (
      <View className="w-16 items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full border border-dashed border-line-strong bg-field">
          <Ionicons name="person-outline" size={20} color={colors.textSubtle} />
        </View>
        <Text className="mt-1 text-micro text-fg-faint">Unassigned</Text>
      </View>
    );
  }

  const firstName = assignee.name.trim().split(/\s+/)[0] ?? assignee.name;

  return (
    <View className="w-16 items-center">
      <View>
        <Avatar name={assignee.name} imageUrl={assignee.avatarUrl} size={48} />
        {extraCount > 0 ? (
          <View className="absolute -bottom-0.5 -right-1 min-w-[22px] items-center rounded-full border-2 border-surface bg-fg px-1 py-0.5">
            <Text className="font-sans text-[10px] font-bold text-white">+{extraCount}</Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-1 text-micro font-medium text-fg-sub" numberOfLines={1}>
        {firstName}
      </Text>
    </View>
  );
}

/** Calendar task row: status + priority, title, description, and the assignee on the right. */
export function CalendarEventCard({ task, onPress }: CalendarEventCardProps) {
  const isOverdue = isTaskOverdue(task);
  const statusLabel = isOverdue ? "Overdue" : TASK_STATUS_LABELS[task.status];

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${statusLabel}, ${priorityLabel(task.priority)} priority, ${
        task.assignee ? `assigned to ${task.assignee.name}` : "unassigned"
      }`}
      className="flex-row items-center gap-3 rounded-xl border border-line bg-surface py-3 pl-4 pr-3 active:bg-field"
    >
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Badge label={statusLabel} tone={getTaskTone(task)} hasDot />
          <Badge label={priorityLabel(task.priority)} tone={priorityTone[task.priority]} icon="flag" />
        </View>

        <Text className="mt-2 text-body font-semibold text-fg" numberOfLines={2}>
          {task.title}
        </Text>
        {task.description ? (
          <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
      </View>

      <AssigneeAvatar task={task} />
    </Pressable>
  );
}
