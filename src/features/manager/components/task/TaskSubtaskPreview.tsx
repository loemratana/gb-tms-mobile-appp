import { ListChecks } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

import {
  getStatusColor,
  getStatusLabel,
  getSubtaskCompletionProgress,
  getSubtaskWorkProgress,
} from "@/features/employee/helpers/helpers";
import type { TaskSubtaskSummary } from "@/features/employee/types/types";

type TaskSubtaskPreviewProps = {
  subtasks: TaskSubtaskSummary[];
  variant?: "full" | "compact";
  maxVisible?: number;
  onSubtaskPress?: (subtaskId: string) => void;
};

function uniqueAssignees(subtasks: TaskSubtaskSummary[]) {
  const seen = new Set<string>();

  return subtasks.filter((subtask) => {
    const key = subtask.assigneeName;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function SubtaskChip({
  subtask,
  onPress,
}: {
  subtask: TaskSubtaskSummary;
  onPress?: () => void;
}) {
  const workProgress = getSubtaskWorkProgress(subtask);
  const progressColor = getStatusColor(subtask.status);

  const content = (
    <>
      <View className="flex-row items-center gap-2">
        {subtask.assigneeAvatarUrl ? (
          <Image
            source={{ uri: subtask.assigneeAvatarUrl }}
            className="h-7 w-7 rounded-full bg-[#E5E7EB]"
          />
        ) : (
          <View className="h-7 w-7 items-center justify-center rounded-full bg-[#E5E7EB]">
            <Text className="text-[10px] font-bold text-[#6B7280]">
              {subtask.assigneeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="min-w-0 flex-1">
          <Text
            className="text-[11px] font-semibold text-[#111827]"
            numberOfLines={1}
          >
            {subtask.title}
          </Text>
          <Text className="text-[10px] text-[#6B7280]" numberOfLines={1}>
            {subtask.assigneeName}
          </Text>
        </View>
      </View>

      <View className="mt-2 h-1 overflow-hidden rounded-full bg-[#E5E7EB]">
        <View
          className="h-full rounded-full"
          style={{
            width: `${workProgress}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      <View className="mt-1.5 flex-row items-center justify-between">
        <Text className="text-[10px] font-medium text-[#6B7280]">
          {getStatusLabel(subtask.status)}
        </Text>
        <Text className="text-[10px] font-semibold text-[#111827]">
          {workProgress}%
        </Text>
      </View>

      {onPress ? (
        <Text className="mt-1 text-[10px] font-semibold text-[#32CD32]">View work</Text>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View className="mr-2 w-[136px] rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-2">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="mr-2 w-[136px] rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-2 active:bg-[#F9FAFB]"
      accessibilityRole="button"
      accessibilityLabel={`View work for ${subtask.title}`}
    >
      {content}
    </Pressable>
  );
}

function AssigneeAvatarRow({
  assignees,
  max = 4,
}: {
  assignees: TaskSubtaskSummary[];
  max?: number;
}) {
  const visible = assignees.slice(0, max);
  const overflow = assignees.length - visible.length;

  return (
    <View className="flex-row items-center">
      {visible.map((assignee, index) =>
        assignee.assigneeAvatarUrl ? (
          <Image
            key={`${assignee.assigneeName}-${index}`}
            source={{ uri: assignee.assigneeAvatarUrl }}
            className="h-6 w-6 rounded-full border-2 border-white bg-[#E5E7EB]"
            style={{ marginLeft: index > 0 ? -8 : 0 }}
          />
        ) : (
          <View
            key={`${assignee.assigneeName}-${index}`}
            className="h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB]"
            style={{ marginLeft: index > 0 ? -8 : 0 }}
          >
            <Text className="text-[9px] font-bold text-[#6B7280]">
              {assignee.assigneeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        ),
      )}
      {overflow > 0 ? (
        <View
          className="h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F3F4F6]"
          style={{ marginLeft: -8 }}
        >
          <Text className="text-[9px] font-bold text-[#6B7280]">+{overflow}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function TaskSubtaskPreview({
  subtasks,
  variant = "full",
  maxVisible = 3,
  onSubtaskPress,
}: TaskSubtaskPreviewProps) {
  if (subtasks.length === 0) return null;

  const completedCount = subtasks.filter((task) => task.status === "done").length;
  const overallProgress = getSubtaskCompletionProgress(subtasks);
  const assignees = uniqueAssignees(subtasks);
  const visible = subtasks.slice(0, maxVisible);
  const remaining = subtasks.length - visible.length;

  if (variant === "compact") {
    return (
      <View className="mt-2 flex-row items-center gap-2">
        <AssigneeAvatarRow assignees={assignees} />
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <ListChecks size={12} color="#15803D" strokeWidth={2.2} />
          <Text className="text-[11px] font-medium text-[#15803D]" numberOfLines={1}>
            {subtasks.length} subtask{subtasks.length === 1 ? "" : "s"} · {overallProgress}%
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <ListChecks size={13} color="#6B7280" strokeWidth={2.2} />
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Subtasks
          </Text>
        </View>
        <Text className="text-[11px] font-semibold text-[#15803D]">
          {completedCount}/{subtasks.length} done · {overallProgress}%
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {visible.map((subtask) => (
          <SubtaskChip
            key={subtask.id}
            subtask={subtask}
            onPress={onSubtaskPress ? () => onSubtaskPress(subtask.id) : undefined}
          />
        ))}
      </View>

      {remaining > 0 ? (
        <Text className="mt-2 text-[11px] font-medium text-[#6B7280]">
          +{remaining} more subtask{remaining === 1 ? "" : "s"} — open task to view all
        </Text>
      ) : null}
    </View>
  );
}
