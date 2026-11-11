import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarStack } from "@/features/tasks/components/shared/AvatarStack";
import { StatusBadge } from "@/features/tasks/components/shared/StatusBadge";
import { ActivityCounts, DueDateChip } from "@/features/tasks/components/shared/TaskMeta";
import type { Task } from "@/features/tasks/types/taskView.types";
import {
  formatDate,
  getPriorityLabel,
  getStatusLabel,
  getTaskDisplayProgress,
  isTaskOverdue,
} from "@/features/tasks/utils/task.utils";
import { priorityTone } from "@/styles";

type TaskCardProps = {
  task: Task;
  /** Current user's id — shows the "You" marker when they're an assignee. */
  currentUserId?: string;
  onPress?: (task: Task) => void;
  /** Confirms a newly-assigned task, moving it into progress. Only shown for
   * tasks that are still "todo" and assigned to the current user. */
  onConfirm?: (task: Task) => void;
  confirming?: boolean;
};

/** Task card for the "My Tasks" list: status, priority, title, progress, due date, people. */
export const TaskCard = memo(function TaskCard({
  task,
  currentUserId,
  onPress,
  onConfirm,
  confirming = false,
}: TaskCardProps) {
  const isOverdue = isTaskOverdue(task);
  const isClosed = task.status === "done" || task.status === "cancelled";
  const comments = task.commentCount ?? 0;
  const attachments = task.attachmentCount ?? 0;
  const assignees = task.assignees ?? [];
  const isAssignedToMe = Boolean(currentUserId) && assignees.some((person) => person.id === currentUserId);
  const canConfirm = Boolean(onConfirm) && isAssignedToMe && task.status === "todo";
  const progress = getTaskDisplayProgress(task);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${getStatusLabel(task.status)}, ${getPriorityLabel(task.priority)} priority, due ${formatDate(task.dueDate)}${isOverdue ? ", overdue" : ""}`}
      className="w-full rounded-2xl border border-line bg-surface p-4 active:bg-field"
    >
      <View className="flex-row items-center justify-between gap-2">
        <StatusBadge status={task.status} />
        <Badge label={getPriorityLabel(task.priority)} tone={priorityTone[task.priority]} icon="flag" />
      </View>

      <Text
        className={`mt-3 text-headline font-semibold leading-[22px] ${isClosed ? "text-fg-soft" : "text-fg"}`}
        numberOfLines={2}
      >
        {task.title}
      </Text>
      {task.description ? (
        <Text className="mt-1 text-caption leading-[18px] text-fg-soft" numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      {!isClosed ? (
        <View className="mt-3.5 flex-row items-center gap-3">
          <View className="flex-1">
            <ProgressBar value={progress} accessibilityLabel="Task progress" />
          </View>
          <Text className="min-w-[34px] text-right text-label font-semibold text-fg-sub">{progress}%</Text>
        </View>
      ) : null}

      <View className="mt-3.5 flex-row items-center justify-between gap-2 border-t border-line-soft pt-3">
        <View className="flex-1 flex-row items-center gap-3">
          <DueDateChip dueDate={task.dueDate} isOverdue={isOverdue} />
          <ActivityCounts comments={comments} attachments={attachments} />
        </View>
        <View className="flex-row items-center gap-2">
          {isAssignedToMe ? <Text className="text-label font-semibold text-brand-strong">You</Text> : null}
          <AvatarStack people={assignees} />
        </View>
      </View>

      {canConfirm ? (
        <View className="mt-3.5">
          <Button
            label="Accept & start"
            icon="checkmark-circle-outline"
            isLoading={confirming}
            onPress={() => onConfirm?.(task)}
          />
        </View>
      ) : null}
    </Pressable>
  );
});
