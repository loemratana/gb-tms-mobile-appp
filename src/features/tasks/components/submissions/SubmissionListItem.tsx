import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { TaskSubmissionResponse } from "@/features/tasks/types/submission.types";
import {
  SUBMISSION_STATUS_STYLE,
  formatSubmissionDateTime,
} from "@/features/tasks/utils/submissionStatus";
import { palette } from "@/styles";

type SubmissionListItemProps = {
  submission: TaskSubmissionResponse;
  /** Show who submitted — useful in the review queue, redundant in "My submissions". */
  showSubmitter?: boolean;
  onPress: () => void;
};

/** Compact cross-task submission card; tapping opens the task, which has the full files and history. */
export function SubmissionListItem({
  submission,
  showSubmitter = false,
  onPress,
}: SubmissionListItemProps) {
  const status = SUBMISSION_STATUS_STYLE[submission.status];
  const attachmentCount = submission.images.length + submission.files.length;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open task ${submission.taskTitle}`}
      className="rounded-2xl border border-line bg-surface p-4 active:bg-field"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-body font-semibold text-fg" numberOfLines={2}>
          {submission.taskTitle}
        </Text>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: status.bg }}>
          <Text className="text-micro font-semibold" style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text className="mt-1 text-label text-fg-soft">
        Round {submission.round}
        {showSubmitter ? ` · ${submission.submittedByName}` : ""} ·{" "}
        {formatSubmissionDateTime(submission.submittedAt)}
      </Text>

      {submission.late ? (
        <View className="mt-2 flex-row items-start gap-1.5 rounded-xl bg-error-subtle px-3 py-2">
          <Ionicons name="alert-circle" size={14} color={palette.red[600]} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-label text-error-fg" numberOfLines={2}>
            Late{submission.lateReason ? `: ${submission.lateReason}` : ""}
          </Text>
        </View>
      ) : null}

      {submission.note ? (
        <Text className="mt-2 text-caption text-fg-sub" numberOfLines={2}>
          {submission.note}
        </Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="attach" size={14} color={palette.gray[400]} />
          <Text className="text-label text-fg-soft">
            {attachmentCount === 0
              ? "No attachments"
              : `${submission.images.length} images · ${submission.files.length} files`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={palette.gray[400]} />
      </View>

      {submission.status === "REJECTED" && submission.reviewComment ? (
        <View className="mt-3 rounded-xl bg-error-subtle px-3 py-2">
          <Text className="text-label text-error-fg" numberOfLines={3}>
            {submission.reviewedByName ?? "Reviewer"}: “{submission.reviewComment}”
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
