import { useRouter } from "expo-router";
import {
    Calendar,
    ChevronRight,
    Flag,
    MessageCircle,
    Paperclip,
} from "lucide-react-native";
import { memo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import {
    formatDate,
    getPriorityLabel,
    getSubtaskCompletionProgress,
} from "@/features/employee/helpers/helpers";
import type {
    Task,
    TaskPriority,
    TaskSubtaskSummary,
} from "@/features/employee/types/types";

import { AvatarStack } from "@/features/manager/components/task/AvatarStack";
import { SegmentedProgressBar } from "@/features/manager/components/task/SegmentedProgressBar";
import { StatusBadge } from "@/features/manager/components/task/StatusBadge";
import { TaskSubtaskPreview } from "@/features/manager/components/task/TaskSubtaskPreview";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#32CD32",
  medium: "#F59E0B",
  high: "#EF4444",
  urgent: "#EF4444",
};

type ManagerTaskCardProps = {
  task: Task;
  subtasks?: TaskSubtaskSummary[];
  onPress?: (task: Task) => void;
  commentCount?: number;
  attachmentCount?: number;
};

export const ManagerTaskCard = memo(function ManagerTaskCard({
  task,
  subtasks = [],
  onPress,
  commentCount,
  attachmentCount,
}: ManagerTaskCardProps) {
  const router = useRouter();
  const displayProgress =
    subtasks.length > 0
      ? getSubtaskCompletionProgress(subtasks)
      : task.progress;

  const comments = commentCount ?? task.commentCount ?? 0;
  const attachments = attachmentCount ?? task.attachmentCount ?? 0;
  const priorityColor = PRIORITY_COLORS[task.priority];

  const handleSubtaskPress = (subtaskId: string) => {
    router.push({
      pathname: "/(manager)/tasks/[id]",
      params: { id: subtaskId },
    });
  };

  return (
    <View className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white">
      <Pressable
        onPress={() => onPress?.(task)}
        accessibilityRole="button"
        accessibilityLabel={`Open task ${task.title}`}
        className="p-3"
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text
              className="text-[17px] font-bold leading-6 text-[#111827]"
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <Text
              className="mt-1.5 text-[13px] leading-5 text-[#6B7280]"
              numberOfLines={2}
            >
              {task.description}
            </Text>
          </View>
          <View className="shrink-0">
            <StatusBadge status={task.status} />
          </View>
        </View>

        <TaskSubtaskPreview
          subtasks={subtasks}
          maxVisible={2}
          onSubtaskPress={handleSubtaskPress}
        />

        <View className="mt-4">
          <SegmentedProgressBar progress={displayProgress} animated={false} />
        </View>

        <View className="mt-4 flex-row flex-wrap items-center gap-x-4 gap-y-2">
          <MetaItem
            icon={<Calendar size={14} color="#9CA3AF" strokeWidth={2.2} />}
            label={formatDate(task.dueDate)}
          />
          <MetaItem
            icon={<Flag size={14} color={priorityColor} strokeWidth={2.2} />}
            label={getPriorityLabel(task.priority)}
            labelColor={priorityColor}
          />
          <MetaItem
            icon={<MessageCircle size={14} color="#9CA3AF" strokeWidth={2.2} />}
            label={String(comments)}
          />
          <MetaItem
            icon={<Paperclip size={14} color="#9CA3AF" strokeWidth={2.2} />}
            label={String(attachments)}
          />
        </View>

        <View className="mt-4 flex-row items-center justify-between border-t border-[#F3F4F6] pt-4">
          <AvatarStack people={task.assignees} />

          <View className="flex-row items-center gap-1 rounded-full bg-[#F9FAFB] px-3 py-2">
            <Text className="text-[12px] font-semibold text-[#374151]">
              View Details
            </Text>
            <ChevronRight size={16} color="#32CD32" strokeWidth={2.4} />
          </View>
        </View>
      </Pressable>
    </View>
  );
});

type MetaItemProps = {
  icon: ReactNode;
  label: string;
  labelColor?: string;
};

function MetaItem({ icon, label, labelColor = "#6B7280" }: MetaItemProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon}
      <Text className="text-[12px] font-medium" style={{ color: labelColor }}>
        {label}
      </Text>
    </View>
  );
}
