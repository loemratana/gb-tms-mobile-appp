import { Image, Pressable, Text, View } from "react-native";

import {
  PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  getTaskColor,
} from "@/features/manager/data/calendarTasks";
import type { TaskResponse } from "@/features/tasks/types/task.types";

type CalendarEventCardProps = {
  task: TaskResponse;
  onPress?: (task: TaskResponse) => void;
};

function InitialsAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6]">
      <Text className="text-[10px] font-bold text-[#6B7280]">{initial}</Text>
    </View>
  );
}

export function CalendarEventCard({ task, onPress }: CalendarEventCardProps) {
  const color = getTaskColor(task);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      className="mb-3 flex-row items-start gap-3 rounded-2xl bg-white p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-base font-bold text-[#111827]" numberOfLines={2}>
            {task.title}
          </Text>

          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${color}18` }}>
            <Text className="text-[11px] font-semibold" style={{ color }}>
              {TASK_STATUS_LABELS[task.status]}
            </Text>
          </View>
        </View>

        {task.description ? (
          <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View className="mt-2 flex-row items-center gap-2">
          {task.assignee ? (
            <>
              {task.assignee.avatarUrl ? (
                <Image
                  source={{ uri: task.assignee.avatarUrl }}
                  className="h-6 w-6 rounded-full bg-[#F3F4F6]"
                />
              ) : (
                <InitialsAvatar name={task.assignee.name} />
              )}
              <Text className="text-xs text-gray-500">{task.assignee.name}</Text>
            </>
          ) : (
            <Text className="text-xs text-gray-400">Unassigned</Text>
          )}

          <View
            className="ml-auto rounded-md px-2 py-0.5"
            style={{ backgroundColor: `${PRIORITY_COLORS[task.priority]}18` }}
          >
            <Text
              className="text-[10px] font-bold uppercase"
              style={{ color: PRIORITY_COLORS[task.priority] }}
            >
              {task.priority}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
