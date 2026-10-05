import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import {
  formatDate,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  isTaskOverdue,
} from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

const OVERDUE_COLOR = "#EF4444";

type TaskHeroCardProps = {
  task: Task;
};

export function TaskHeroCard({ task }: TaskHeroCardProps) {
  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const overdue = isTaskOverdue(task);

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
        <Text
          className="text-[12px] font-bold tracking-wide"
          style={{ color: statusColor }}
        >
          {getStatusLabel(task.status)}
        </Text>
      </View>

      <Text className="mt-2 text-[22px] font-bold leading-7 text-[#111827]">
        {task.title}
      </Text>

      {task.description ? (
        <Text className="mt-2 text-[14px] leading-5 text-[#6B7280]">
          {task.description}
        </Text>
      ) : null}

      <View className="mt-4 flex-row flex-wrap items-center gap-x-4 gap-y-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="time-outline"
            size={15}
            color={overdue ? OVERDUE_COLOR : "#9CA3AF"}
          />
          <Text
            className="text-[13px] font-medium"
            style={{ color: overdue ? OVERDUE_COLOR : "#6B7280" }}
          >
            {overdue ? "Overdue · " : "Due "}
            {formatDate(task.dueDate)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flag-outline" size={14} color={priorityColor} />
          <Text className="text-[13px] font-medium" style={{ color: priorityColor }}>
            {getPriorityLabel(task.priority)} priority
          </Text>
        </View>
      </View>
    </View>
  );
}
