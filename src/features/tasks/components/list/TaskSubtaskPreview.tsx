import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, Text, View } from "react-native";

import {
  getStatusColor,
  getStatusLabel,
  getSubtaskCompletionProgress,
  getSubtaskWorkProgress,
} from "@/features/tasks/utils/task.utils";
import type { TaskSubtaskSummary } from "@/features/tasks/types/taskView.types";
import { colors } from "@/styles";

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
            className="h-7 w-7 rounded-full bg-line"
          />
        ) : (
          <View className="h-7 w-7 items-center justify-center rounded-full bg-line">
            <Text className="text-[10px] font-bold text-fg-soft">
              {subtask.assigneeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="min-w-0 flex-1">
          <Text
            className="text-micro font-semibold text-fg"
            numberOfLines={1}
          >
            {subtask.title}
          </Text>
          <Text className="text-[10px] text-fg-soft" numberOfLines={1}>
            {subtask.assigneeName}
          </Text>
        </View>
      </View>

      <View className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <View
          className="h-full rounded-full"
          style={{
            width: `${workProgress}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      <View className="mt-1.5 flex-row items-center justify-between">
        <Text className="text-[10px] font-medium text-fg-soft">
          {getStatusLabel(subtask.status)}
        </Text>
        <Text className="text-[10px] font-semibold text-fg">
          {workProgress}%
        </Text>
      </View>

      {onPress ? (
        <Text className="mt-1 text-[10px] font-semibold text-brand-strong">View work</Text>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View className="mr-2 w-[136px] rounded-xl border border-line bg-surface px-2.5 py-2">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="mr-2 w-[136px] rounded-xl border border-line bg-surface px-2.5 py-2 active:bg-field"
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
            className="h-6 w-6 rounded-full border-2 border-surface bg-line"
            style={{ marginLeft: index > 0 ? -8 : 0 }}
          />
        ) : (
          <View
            key={`${assignee.assigneeName}-${index}`}
            className="h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-line"
            style={{ marginLeft: index > 0 ? -8 : 0 }}
          >
            <Text className="text-[9px] font-bold text-fg-soft">
              {assignee.assigneeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        ),
      )}
      {overflow > 0 ? (
        <View
          className="h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-subtle"
          style={{ marginLeft: -8 }}
        >
          <Text className="text-[9px] font-bold text-fg-soft">+{overflow}</Text>
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
          <Ionicons name="checkbox-outline" size={12} color={colors.brandStrong} />
          <Text className="text-micro font-medium text-brand-strong" numberOfLines={1}>
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
          <Ionicons name="checkbox-outline" size={13} color={colors.textMuted} />
          <Text className="text-micro font-semibold uppercase tracking-wide text-fg-faint">
            Subtasks
          </Text>
        </View>
        <Text className="text-micro font-semibold text-brand-strong">
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
        <Text className="mt-2 text-micro font-medium text-fg-soft">
          +{remaining} more subtask{remaining === 1 ? "" : "s"} — open task to view all
        </Text>
      ) : null}
    </View>
  );
}
