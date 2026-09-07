import { ScrollView, Text, View } from "react-native";

import type { Task, TaskStatus } from "@/features/employee/types/types";
import { STATUS_CONFIG } from "@/features/manager/components/task/StatusBadge";

const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
];

type ManagerTaskStatsBarProps = {
  tasks: Task[];
};

function StatTile({
  label,
  value,
  bg,
  color,
}: {
  label: string;
  value: number;
  bg: string;
  color: string;
}) {
  return (
    <View
      className="mr-2.5 min-w-[92px] rounded-2xl px-3.5 py-3"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-[20px] font-bold" style={{ color }}>
        {value}
      </Text>
      <Text
        className="mt-0.5 text-[11px] font-semibold"
        style={{ color }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/** Overview of tasks this manager assigned — independent of whatever search/filter is active in the list below. */
export function ManagerTaskStatsBar({ tasks }: ManagerTaskStatsBarProps) {
  const counts = STATUS_ORDER.reduce<Record<TaskStatus, number>>(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status).length;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border-b border-[#E5E7EB] bg-white"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <StatTile label="Total Tasks" value={tasks.length} bg="#111827" color="#FFFFFF" />
      {STATUS_ORDER.map((status) => (
        <StatTile
          key={status}
          label={STATUS_CONFIG[status].label}
          value={counts[status]}
          bg={STATUS_CONFIG[status].bg}
          color={STATUS_CONFIG[status].color}
        />
      ))}
    </ScrollView>
  );
}
