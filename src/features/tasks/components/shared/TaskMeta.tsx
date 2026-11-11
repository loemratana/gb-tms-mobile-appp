import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { formatDate } from "@/features/tasks/utils/task.utils";
import { colors } from "@/styles";

/** Due date chip; turns red with "Overdue ·" when the task is late. */
export function DueDateChip({ dueDate, isOverdue }: { dueDate: string; isOverdue: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-lg px-2 py-1 ${isOverdue ? "bg-error-subtle" : "bg-subtle"}`}
      accessible
      accessibilityLabel={`${isOverdue ? "Overdue, was due" : "Due"} ${formatDate(dueDate)}`}
    >
      <Ionicons
        name={isOverdue ? "alert-circle-outline" : "calendar-outline"}
        size={13}
        color={isOverdue ? colors.danger : colors.textMuted}
      />
      <Text className={`text-label font-semibold ${isOverdue ? "text-error" : "text-fg-sub"}`}>
        {isOverdue ? "Overdue · " : ""}
        {formatDate(dueDate)}
      </Text>
    </View>
  );
}

function Count({ icon, value, label }: { icon: ComponentProps<typeof Ionicons>["name"]; value: number; label: string }) {
  return (
    <View className="flex-row items-center gap-1" accessible accessibilityLabel={`${value} ${label}${value === 1 ? "" : "s"}`}>
      <Ionicons name={icon} size={14} color={colors.textSubtle} />
      <Text className="text-label font-semibold text-fg-sub">{value}</Text>
    </View>
  );
}

/** Comment and attachment counts; each is hidden when zero. */
export function ActivityCounts({ comments, attachments }: { comments: number; attachments: number }) {
  if (comments === 0 && attachments === 0) return null;
  return (
    <View className="flex-row items-center gap-3">
      {comments > 0 ? <Count icon="chatbubble-outline" value={comments} label="comment" /> : null}
      {attachments > 0 ? <Count icon="attach" value={attachments} label="attachment" /> : null}
    </View>
  );
}
