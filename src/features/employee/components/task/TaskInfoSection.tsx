import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { formatDate } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

type TaskInfoSectionProps = {
  task: Task;
};

const ROWS: {
  key: keyof Pick<
    Task,
    "startDate" | "dueDate" | "taskType" | "project" | "team"
  >;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  format?: (task: Task) => string;
}[] = [
  {
    key: "startDate",
    label: "Start date",
    icon: "play-outline",
    format: (t) => (t.startDate ? formatDate(t.startDate) : "—"),
  },
  {
    key: "dueDate",
    label: "Due date",
    icon: "flag-outline",
    format: (t) => formatDate(t.dueDate),
  },
  {
    key: "taskType",
    label: "Task type",
    icon: "layers-outline",
    format: (t) => t.taskType ?? "General",
  },
  {
    key: "project",
    label: "Project",
    icon: "folder-outline",
    format: (t) => t.project ?? "—",
  },
  {
    key: "team",
    label: "Team",
    icon: "people-outline",
    format: (t) => t.team ?? "—",
  },
];

export function TaskInfoSection({ task }: TaskInfoSectionProps) {
  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Task information
      </Text>

      <View>
        {ROWS.map((row, index) => (
          <View
            key={row.key}
            className={`flex-row items-center px-3 py-3.5 ${
              index < ROWS.length - 1 ? "border-b border-[#F3F4F6]" : ""
            }`}
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-2xl bg-[#F3F4F6]">
              <Ionicons name={row.icon} size={17} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-[#9CA3AF]">{row.label}</Text>
              <Text className="mt-0.5 text-[14px] font-semibold text-[#111827]">
                {row.format?.(task) ?? "—"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
