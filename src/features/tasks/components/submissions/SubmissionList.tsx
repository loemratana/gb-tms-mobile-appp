import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { SkeletonBlock } from "@/components/ui/Skeleton";
import { SubmissionListItem } from "./SubmissionListItem";
import type { TaskSubmissionResponse } from "@/features/tasks/types/submission.types";
import { palette } from "@/styles";

type SubmissionListProps = {
  submissions: TaskSubmissionResponse[] | undefined;
  /** Total across all pages, from the API's PageResponse. */
  totalElements: number | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyTitle: string;
  emptyMessage: string;
  showSubmitter?: boolean;
  onOpenSubmission: (submission: TaskSubmissionResponse) => void;
};

/** Loading / error / empty / list states for the cross-task submission screens. */
export function SubmissionList({
  submissions,
  totalElements,
  isLoading,
  isError,
  onRetry,
  emptyTitle,
  emptyMessage,
  showSubmitter = false,
  onOpenSubmission,
}: SubmissionListProps) {
  if (isLoading) {
    return (
      <View className="gap-3">
        {[0, 1, 2].map((index) => (
          <SkeletonBlock key={index} height={120} radius={16} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center rounded-2xl border border-error-border bg-error-subtle p-4">
        <Text className="text-body-sm font-semibold text-error">
          Couldn&apos;t load submissions
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-3 rounded-xl bg-surface px-4 py-2.5"
        >
          <Text className="text-caption font-semibold text-fg">Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <View className="items-center rounded-2xl bg-surface px-6 py-10">
        <Ionicons name="file-tray-outline" size={32} color={palette.gray[400]} />
        <Text className="mt-3 text-body font-semibold text-fg">{emptyTitle}</Text>
        <Text className="mt-1 text-center text-caption text-fg-soft">{emptyMessage}</Text>
      </View>
    );
  }

  const hasMore = totalElements !== undefined && totalElements > submissions.length;

  return (
    <View className="gap-3">
      {submissions.map((submission) => (
        <SubmissionListItem
          key={submission.id}
          submission={submission}
          showSubmitter={showSubmitter}
          onPress={() => onOpenSubmission(submission)}
        />
      ))}
      {hasMore ? (
        <Text className="py-2 text-center text-label text-fg-faint">
          Showing {submissions.length} of {totalElements}
        </Text>
      ) : null}
    </View>
  );
}
