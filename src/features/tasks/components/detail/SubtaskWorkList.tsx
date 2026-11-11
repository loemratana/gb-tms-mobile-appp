import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Platform, Pressable, Text, View } from "react-native";

import {
  getLatestWorkActivity,
  getStatusColor,
  getStatusLabel,
  getSubtaskCompletionProgress,
  getSubtaskFullTask,
  getSubtaskWorkProgress,
} from "@/features/tasks/utils/task.utils";
import type { Task, TaskSubtaskSummary } from "@/features/tasks/types/taskView.types";
import { colors, palette } from "@/styles";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
});

type SubtaskWorkListProps = {
  subtasks: TaskSubtaskSummary[];
  allTasks: Task[];
  onSubtaskPress?: (subtaskId: string) => void;
};

export function SubtaskWorkList({
  subtasks,
  allTasks,
  onSubtaskPress,
}: SubtaskWorkListProps) {
  if (subtasks.length === 0) return null;

  const overallProgress = getSubtaskCompletionProgress(subtasks);
  const completedCount = subtasks.filter((item) => item.status === "done").length;

  return (
    <View className="mt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="checkbox-outline" size={14} color={colors.textSecondary} />
          <Text className="text-caption font-semibold text-fg">Subtask work</Text>
        </View>
        <Text className="text-micro font-semibold text-brand-strong">
          {completedCount}/{subtasks.length} done · {overallProgress}%
        </Text>
      </View>

      <View className="gap-2">
        {subtasks.map((subtask) => {
          const fullTask = getSubtaskFullTask(allTasks, subtask.id);
          const latestWork = fullTask ? getLatestWorkActivity(fullTask) : undefined;
          const workProgress = getSubtaskWorkProgress(subtask);
          const progressColor = getStatusColor(subtask.status);

          return (
            <Pressable
              key={subtask.id}
              onPress={() => onSubtaskPress?.(subtask.id)}
              disabled={!onSubtaskPress}
              className="rounded-2xl border border-line bg-field px-3.5 py-3"
              style={CARD_SHADOW}
              accessibilityRole="button"
              accessibilityLabel={`View work for ${subtask.title}`}
            >
              <View className="flex-row items-center gap-3">
                {subtask.assigneeAvatarUrl ? (
                  <Image
                    source={{ uri: subtask.assigneeAvatarUrl }}
                    className="h-10 w-10 rounded-full bg-line"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-line">
                    <Text className="text-label font-bold text-fg-soft">
                      {subtask.assigneeName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View className="min-w-0 flex-1">
                  <Text
                    className="text-body-sm font-semibold text-fg"
                    numberOfLines={1}
                  >
                    {subtask.title}
                  </Text>
                  <Text className="mt-0.5 text-label text-fg-soft" numberOfLines={1}>
                    {subtask.assigneeName} · {getStatusLabel(subtask.status)}
                  </Text>
                </View>

                {onSubtaskPress ? (
                  <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                ) : null}
              </View>

              <View className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${workProgress}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </View>

              <View className="mt-2 flex-row items-start gap-2 rounded-xl bg-surface px-3 py-2">
                <Ionicons name="attach" size={14} color={palette.violet[500]} />
                <View className="min-w-0 flex-1">
                  {latestWork ? (
                    <>
                      <Text className="text-label font-medium text-fg-sub" numberOfLines={2}>
                        {latestWork.title}
                      </Text>
                      <Text className="mt-0.5 text-micro text-fg-faint">
                        {latestWork.timestamp}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-label text-fg-faint">No work submitted yet</Text>
                  )}
                </View>
                <Text className="text-micro font-semibold text-fg">
                  {workProgress}%
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
