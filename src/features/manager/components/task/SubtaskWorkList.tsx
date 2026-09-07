import { ChevronRight, ListChecks, Paperclip } from "lucide-react-native";
import { Image, Platform, Pressable, Text, View } from "react-native";

import {
  getLatestWorkActivity,
  getStatusColor,
  getStatusLabel,
  getSubtaskCompletionProgress,
  getSubtaskFullTask,
  getSubtaskWorkProgress,
} from "@/features/employee/helpers/helpers";
import type { Task, TaskSubtaskSummary } from "@/features/employee/types/types";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
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
          <ListChecks size={14} color="#374151" strokeWidth={2.2} />
          <Text className="text-[13px] font-semibold text-[#111827]">Subtask work</Text>
        </View>
        <Text className="text-[11px] font-semibold text-[#15803D]">
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
              className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-3.5 py-3"
              style={CARD_SHADOW}
              accessibilityRole="button"
              accessibilityLabel={`View work for ${subtask.title}`}
            >
              <View className="flex-row items-center gap-3">
                {subtask.assigneeAvatarUrl ? (
                  <Image
                    source={{ uri: subtask.assigneeAvatarUrl }}
                    className="h-10 w-10 rounded-full bg-[#E5E7EB]"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <Text className="text-[12px] font-bold text-[#6B7280]">
                      {subtask.assigneeName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[14px] font-semibold text-[#111827]"
                    numberOfLines={1}
                  >
                    {subtask.title}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-[#6B7280]" numberOfLines={1}>
                    {subtask.assigneeName} · {getStatusLabel(subtask.status)}
                  </Text>
                </View>

                {onSubtaskPress ? (
                  <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.2} />
                ) : null}
              </View>

              <View className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${workProgress}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </View>

              <View className="mt-2 flex-row items-start gap-2 rounded-xl bg-white px-3 py-2">
                <Paperclip size={14} color="#8B5CF6" strokeWidth={2.2} />
                <View className="min-w-0 flex-1">
                  {latestWork ? (
                    <>
                      <Text className="text-[12px] font-medium text-[#374151]" numberOfLines={2}>
                        {latestWork.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-[#9CA3AF]">
                        {latestWork.timestamp}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-[12px] text-[#9CA3AF]">No work submitted yet</Text>
                  )}
                </View>
                <Text className="text-[11px] font-semibold text-[#111827]">
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
