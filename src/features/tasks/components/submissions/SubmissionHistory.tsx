import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import type {
  SubmissionFileResponse,
  TaskSubmissionResponse,
} from "@/features/tasks/types/submission.types";
import { formatFileSize, getDocumentIcon } from "@/features/tasks/types/workUpdate.types";
import {
  SUBMISSION_STATUS_STYLE,
  formatSubmissionDateTime,
} from "@/features/tasks/utils/submissionStatus";
import { getRemoteImageSource, getRemoteImageUrl } from "@/lib/remoteImage";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles";
import { toast } from "@/stores/toastStore";

async function openFile(file: SubmissionFileResponse) {
  try {
    await WebBrowser.openBrowserAsync(getRemoteImageUrl(file.url), {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
    });
  } catch {
    toast.error("Can't open file", `${file.originalName} couldn't be opened on this device.`);
  }
}

type AttachmentHandlers = {
  accessToken: string | null;
  onOpenImage: (image: SubmissionFileResponse) => void;
  onOpenFile: (file: SubmissionFileResponse) => void;
};

/** The one place a submission's review status is shown. */
function StatusPill({ submission }: { submission: TaskSubmissionResponse }) {
  const style = SUBMISSION_STATUS_STYLE[submission.status];
  return (
    <View className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: style.bg }}>
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      <Text className="text-micro font-semibold" style={{ color: style.color }}>
        {style.label}
      </Text>
    </View>
  );
}

/** What was submitted: late reason, note, photos and files. */
function SubmissionContent({
  submission,
  accessToken,
  onOpenImage,
  onOpenFile,
}: { submission: TaskSubmissionResponse } & AttachmentHandlers) {
  const hasContent =
    submission.late || submission.note || submission.images.length > 0 || submission.files.length > 0;
  if (!hasContent) return null;

  return (
    <View className="gap-3 pt-3">
      {submission.late ? (
        <View className="flex-row items-start gap-2">
          <Ionicons name="alert-circle" size={15} color={colors.danger} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-caption text-error-fg">
            <Text className="font-semibold">Submitted late</Text>
            {submission.lateReason ? ` — ${submission.lateReason}` : ""}
          </Text>
        </View>
      ) : null}

      {submission.note ? (
        <Text className="text-body-sm text-fg">{submission.note}</Text>
      ) : null}

      {submission.images.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {submission.images.map((image) => (
            <Pressable
              key={image.id}
              onPress={() => onOpenImage(image)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`View image ${image.originalName}`}
              className="aspect-square w-[31.5%] overflow-hidden rounded-xl bg-subtle active:opacity-80"
            >
              <Image
                source={getRemoteImageSource(image.url, accessToken)}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </View>
      ) : null}

      {submission.files.length > 0 ? (
        <View>
          {submission.files.map((file, index) => (
            <Pressable
              key={file.id}
              onPress={() => onOpenFile(file)}
              accessibilityRole="button"
              accessibilityLabel={`Open file ${file.originalName}`}
              className={`flex-row items-center gap-3 py-2.5 active:opacity-70 ${
                index > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-subtle">
                <Ionicons name={getDocumentIcon(file.contentType, file.originalName)} size={18} color={colors.textMuted} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-caption font-medium text-fg" numberOfLines={1}>
                  {file.originalName}
                </Text>
                <Text className="text-micro text-fg-faint">{formatFileSize(file.size)}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.textSubtle} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** The reviewer's answer, like a reply under the submission. */
function ReviewFooter({ submission }: { submission: TaskSubmissionResponse }) {
  if (submission.status === "PENDING") {
    return (
      <View className="mt-3 flex-row items-center gap-2">
        <Ionicons name="time-outline" size={16} color={colors.warning} />
        <Text className="text-label text-fg-soft">Waiting for a reviewer</Text>
      </View>
    );
  }

  const isApproved = submission.status === "APPROVED";
  const reviewer = submission.reviewedByName ?? "A reviewer";

  return (
    <View className="mt-3 rounded-xl bg-field px-3 py-2.5">
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={isApproved ? "checkmark-circle" : "close-circle"}
          size={16}
          color={isApproved ? colors.success : colors.danger}
        />
        <Text className="min-w-0 flex-1 text-label text-fg-soft" numberOfLines={1}>
          <Text className="font-semibold text-fg">{reviewer}</Text>
          {isApproved ? " approved this" : " asked for changes"}
        </Text>
        {submission.reviewedAt ? (
          <Text className="text-micro text-fg-faint">{formatSubmissionDateTime(submission.reviewedAt)}</Text>
        ) : null}
      </View>
      {submission.reviewComment ? (
        <Text className="mt-1.5 pl-6 text-caption text-fg-sub">{submission.reviewComment}</Text>
      ) : null}
    </View>
  );
}

/** Who submitted, which round, when, and the review status. */
function SubmissionHeader({
  submission,
  trailing,
}: {
  submission: TaskSubmissionResponse;
  trailing?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Avatar name={submission.submittedByName} size={36} />
      <View className="min-w-0 flex-1">
        <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
          {submission.submittedByName}
        </Text>
        <Text className="text-label text-fg-soft" numberOfLines={1}>
          Round {submission.round} · {formatSubmissionDateTime(submission.submittedAt)}
        </Text>
      </View>
      <StatusPill submission={submission} />
      {trailing}
    </View>
  );
}

/** The latest round, shown in full. */
function LatestSubmission({ submission, ...handlers }: { submission: TaskSubmissionResponse } & AttachmentHandlers) {
  return (
    <View>
      <SubmissionHeader submission={submission} />
      <SubmissionContent submission={submission} {...handlers} />
      <ReviewFooter submission={submission} />
    </View>
  );
}

/** A past round: one compact line that opens to the full submission. */
function EarlierSubmission({
  submission,
  isExpanded,
  hasDivider,
  onToggle,
  ...handlers
}: {
  submission: TaskSubmissionResponse;
  isExpanded: boolean;
  hasDivider: boolean;
  onToggle: () => void;
} & AttachmentHandlers) {
  return (
    <View className={hasDivider ? "border-t border-line-soft" : ""}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={isExpanded ? "Hides this round" : "Shows this round"}
        className="py-3 active:opacity-70"
      >
        <SubmissionHeader
          submission={submission}
          trailing={
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSubtle} />
          }
        />
      </Pressable>
      {isExpanded ? (
        <View className="pb-3">
          <SubmissionContent submission={submission} {...handlers} />
          <ReviewFooter submission={submission} />
        </View>
      ) : null}
    </View>
  );
}

type SubmissionHistoryProps = {
  submissions: TaskSubmissionResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Off when a tab already says "Submissions" right above. */
  showTitle?: boolean;
};

/** Submitted work for a task: the latest round in full, earlier rounds as compact lines. */
export function SubmissionHistory({
  submissions,
  isLoading,
  isError,
  onRetry,
  showTitle = true,
}: SubmissionHistoryProps) {
  const accessToken = useAuthStore((state) => state.token);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewerImage, setViewerImage] = useState<SubmissionFileResponse | null>(null);

  const toggle = (id: string) =>
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handlers: AttachmentHandlers = {
    accessToken,
    onOpenImage: setViewerImage,
    onOpenFile: (file) => void openFile(file),
  };
  const [latest, ...earlier] = submissions ?? [];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View>
          <View className="flex-row items-center gap-3">
            <SkeletonCircle size={36} />
            <View className="flex-1 gap-1.5">
              <SkeletonBlock height={13} className="w-1/2" />
              <SkeletonBlock height={11} className="w-1/3" />
            </View>
          </View>
          <SkeletonBlock height={44} className="mt-3 w-full" />
        </View>
      );
    }
    if (isError && !latest) {
      return (
        <StateView
          variant="error"
          title="Couldn't load submissions"
          message="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={onRetry}
          isCompact
        />
      );
    }
    if (!latest) {
      return (
        <StateView
          variant="empty"
          icon="cloud-upload-outline"
          title="No work submitted yet"
          message="Submitted work and the reviewer's feedback will appear here."
          isCompact
        />
      );
    }
    return (
      <View className="gap-5">
        <LatestSubmission submission={latest} {...handlers} />

        {earlier.length > 0 ? (
          <View>
            <Text className="mb-2 text-label font-semibold uppercase tracking-wider text-fg-faint">
              Earlier rounds
            </Text>
            <View>
              {earlier.map((submission, index) => (
                <EarlierSubmission
                  key={submission.id}
                  submission={submission}
                  isExpanded={expandedIds.has(submission.id)}
                  hasDivider={index > 0}
                  onToggle={() => toggle(submission.id)}
                  {...handlers}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View>
      {showTitle ? (
        <SectionHeader
          title="Submissions"
          meta={submissions && submissions.length > 0 ? String(submissions.length) : undefined}
        />
      ) : null}
      {renderBody()}

      <ImageViewerModal
        uri={viewerImage?.url ?? null}
        accessToken={accessToken}
        title={viewerImage?.originalName}
        onClose={() => setViewerImage(null)}
      />
    </View>
  );
}
