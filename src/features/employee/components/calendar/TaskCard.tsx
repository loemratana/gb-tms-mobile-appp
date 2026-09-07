import { Pressable, Text, View } from "react-native";

import type { Task } from "@/features/employee/types/types";

type CalendarTaskCardProps = {
  task: Task;
  onPress?: (task: Task) => void;
};

function parseStartTime(time?: string) {
  if (!time || time.toLowerCase() === "all day") {
    return { hour: "All", period: "day" };
  }

  const start = time.split(" - ")[0]?.trim() ?? time;
  const match = start.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return { hour: start, period: "" };
  }

  const hourNum = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  return {
    hour: minutes === "00" ? `${hourNum}:00` : `${hourNum}:${minutes}`,
    period,
  };
}

function getBadge(task: Task) {
  if (task.category === "meeting" && task.status === "todo") {
    return { label: "Meet", color: "#2563EB" };
  }

  switch (task.status) {
    case "in_progress":
      return { label: "In Progress", color: "#2563EB" };
    case "done":
      return { label: "Done", color: "#22C55E" };
    case "review":
      return { label: "Review", color: "#F59E0B" };
    default:
      return { label: "To Do", color: "#6B7280" };
  }
}

export function CalendarTaskCard({ task, onPress }: CalendarTaskCardProps) {
  const { hour, period } = parseStartTime(task.time);
  const badge = getBadge(task);
  const participants = task.assignees?.length ?? 0;
  const extraCount = Math.max(participants - 1, 0);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      className="mb-3 flex-row rounded-2xl bg-white p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Left: time block */}
      <View className="mr-4 w-14 items-center justify-center">
        <Text className="text-[10px] font-medium uppercase text-[#6B7280]">
          {period}
        </Text>
        <Text className="text-2xl font-bold text-[#111827]">{hour}</Text>
      </View>

      {/* Divider */}
      <View className="mr-4 w-px self-stretch bg-[#E5E7EB]" />

      {/* Right: task info */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 text-base font-bold text-[#111827]"
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: `${badge.color}18` }}
          >
            <Text
              className="text-[11px] font-semibold"
              style={{ color: badge.color }}
            >
              {badge.label}
            </Text>
          </View>
        </View>

        <Text
          className="mt-1 text-xs text-gray-500"
          numberOfLines={1}
        >
          {task.description}
        </Text>

        <View className="mt-2 flex-row items-center gap-3">
          {task.time ? (
            <Text className="text-xs text-gray-400">{task.time}</Text>
          ) : null}

          {participants > 0 ? (
            <Text className="text-xs text-gray-400">
              {extraCount > 0 ? `+${extraCount}` : `${participants}`}{" "}
              {participants === 1 ? "participant" : "participants"}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
