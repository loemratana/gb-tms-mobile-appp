import { Text, View } from "react-native";

import type { TaskStatus } from "@/features/employee/types/types";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; color: string }
> = {
  todo: { label: "TODO", bg: "#F3F4F6", color: "#6B7280" },
  in_progress: { label: "IN PROGRESS", bg: "#EFF6FF", color: "#2563EB" },
  review: { label: "REVIEW", bg: "#FFF7ED", color: "#F59E0B" },
  done: { label: "DONE", bg: "#ECFDF5", color: "#32CD32" },
  cancelled: { label: "CANCELLED", bg: "#FEF2F2", color: "#EF4444" },
};

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: config.color }}
    >
      <Text className="text-[10px] font-bold tracking-wide text-white">
        {config.label}
      </Text>
    </View>
  );
}
