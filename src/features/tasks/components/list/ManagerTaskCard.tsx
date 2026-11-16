import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarStack } from "@/features/tasks/components/shared/AvatarStack";
import { StatusBadge } from "@/features/tasks/components/shared/StatusBadge";
import { ActivityCounts, DueDateChip } from "@/features/tasks/components/shared/TaskMeta";
import type { Task, TaskSubtaskSummary } from "@/features/tasks/types/taskView.types";
import {
  getPriorityLabel,
  getStatusLabel,
  getTaskDisplayProgress,
  isTaskOverdue,
} from "@/features/tasks/utils/task.utils";
import { priorityTone } from "@/styles";

import { TaskSubtaskPreview } from "./TaskSubtaskPreview";

type ManagerTaskCardProps = {
  task: Task;
  subtasks?: TaskSubtaskSummary[];
  onPress?: (task: Task) => void;
  commentCount?: number;
  attachmentCount?: number;
};

/** Task card for the manager's task list. Same anatomy as `TaskCard`, plus subtask progress. */
export const ManagerTaskCard = memo(function ManagerTaskCard({
  task,
  subtasks = [],
  onPress,
  commentCount,
  attachmentCount,
}: ManagerTaskCardProps) {
  // The server already averages subtasks (and treats an approved/done parent as 100), so use its value.
  const progress = getTaskDisplayProgress(task);
  const isOverdue = isTaskOverdue(task);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${getStatusLabel(task.status)}, ${getPriorityLabel(task.priority)} priority${isOverdue ? ", overdue" : ""}`}
      className="rounded-2xl border border-line bg-surface p-4 active:bg-field"
    >
      <View className="flex-row items-center justify-between gap-2">
        <StatusBadge status={task.status} />
        <Badge label={getPriorityLabel(task.priority)} tone={priorityTone[task.priority]} icon="flag" />
      </View>

      <Text className="mt-3 py-0.5 text-headline font-semibold text-fg" numberOfLines={2}>
        {task.title}
      </Text>
      {task.description ? (
        <Text className="mt-1 text-caption text-fg-soft" numberOfLines={1}>
          {task.description}
        </Text>
      ) : null}

      <TaskSubtaskPreview subtasks={subtasks} variant="compact" />

      <View className="mt-3.5 flex-row items-center gap-3">
        <View className="flex-1">
          <ProgressBar value={progress} accessibilityLabel="Task progress" />
        </View>
        <Text className="min-w-[34px] text-right text-label font-semibold text-fg-sub">{progress}%</Text>
      </View>

      <View className="mt-3.5 flex-row items-center justify-between gap-2 border-t border-line-soft pt-3">
        <View className="flex-1 flex-row items-center gap-3">
          <DueDateChip dueDate={task.dueDate} isOverdue={isOverdue} />
          <ActivityCounts
            comments={commentCount ?? task.commentCount ?? 0}
            attachments={attachmentCount ?? task.attachmentCount ?? 0}
          />
        </View>
        <AvatarStack people={task.assignees} />
      </View>
    </Pressable>
  );
});
