import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";
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
import { palette } from "@/styles";

async function openFile(file: SubmissionFileResponse) {
  try {
    await WebBrowser.openBrowserAsync(getRemoteImageUrl(file.url), {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
    });
  } catch {
    Alert.alert("Can't open file", `${file.originalName} couldn't be opened on this device.`);
  }
}

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

function SubmitterAvatar({ name }: { name: string }) {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-subtle">
      <Text className="text-caption font-bold text-brand-strong">{name.trim().charAt(0).toUpperCase() || "?"}</Text>
    </View>
  );
}

function ReviewOutcome({ submission }: { submission: TaskSubmissionResponse }) {
  if (submission.status === "PENDING") {
    return (
      <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-warning-subtle px-3 py-2.5">
        <Ionicons name="time-outline" size={16} color={palette.amber[600]} />
        <Text className="text-label font-medium text-warning-fg">Waiting for a reviewer</Text>
      </View>
    );
  }

  const isApproved = submission.status === "APPROVED";
  const style = SUBMISSION_STATUS_STYLE[submission.status];

  return (
    <View
      className="mt-4 rounded-xl px-3 py-3"
      style={{ backgroundColor: style.bg, borderLeftWidth: 3, borderLeftColor: style.color }}
    >
      <View className="flex-row items-center gap-1.5">
        <Ionicons
          name={isApproved ? "checkmark-circle" : "close-circle"}
          size={16}
          color={style.color}
        />
        <Text className="flex-1 text-label font-semibold" style={{ color: style.color }}>
          {style.label} by {submission.reviewedByName ?? "a reviewer"}
        </Text>
        {submission.reviewedAt ? (
          <Text className="text-micro text-fg-faint">{formatSubmissionDateTime(submission.reviewedAt)}</Text>
        ) : null}
      </View>
      {submission.reviewComment ? (
        <Text className="mt-1.5 text-caption leading-5 text-fg-sub">{submission.reviewComment}</Text>
      ) : null}
    </View>
  );
}

function SubmissionBody({
  submission,
  accessToken,
  onOpenImage,
  onOpenFile,
}: {
  submission: TaskSubmissionResponse;
  accessToken: string | null;
  onOpenImage: (image: SubmissionFileResponse) => void;
  onOpenFile: (file: SubmissionFileResponse) => void;
}) {
  return (
    <>
      {submission.note ? (
        <Text className="mt-3 text-body-sm leading-[21px] text-fg-sub">{submission.note}</Text>
      ) : null}

      {submission.images.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {submission.images.map((image) => (
            <Pressable
              key={image.id}
              onPress={() => onOpenImage(image)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`View image ${image.originalName}`}
              className="aspect-square w-[31.5%] overflow-hidden rounded-xl bg-subtle"
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
        <View className="mt-3 overflow-hidden">
          {submission.files.map((file, index) => (
            <Pressable
              key={file.id}
              onPress={() => onOpenFile(file)}
              accessibilityRole="button"
              accessibilityLabel={`Open file ${file.originalName}`}
              className={`flex-row items-center gap-3 bg-surface px-3 py-2.5 active:bg-field ${
                index > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-subtle">
                <Ionicons name={getDocumentIcon(file.contentType, file.originalName)} size={18} color={palette.gray[600]} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-caption font-medium text-fg" numberOfLines={1}>
                  {file.originalName}
                </Text>
                <Text className="text-micro text-fg-faint">{formatFileSize(file.size)}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={palette.gray[400]} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <ReviewOutcome submission={submission} />
    </>
  );
}

function SubmissionCard({
  submission,
  isExpanded,
  isCollapsible,
  accessToken,
  onToggle,
  onOpenImage,
  onOpenFile,
}: {
  submission: TaskSubmissionResponse;
  isExpanded: boolean;
  isCollapsible: boolean;
  accessToken: string | null;
  onToggle: () => void;
  onOpenImage: (image: SubmissionFileResponse) => void;
  onOpenFile: (file: SubmissionFileResponse) => void;
}) {
  const attachmentCount = submission.images.length + submission.files.length;

  return (
    <View className="bg-surface p-4">
      <Pressable
        onPress={isCollapsible ? onToggle : undefined}
        disabled={!isCollapsible}
        accessibilityRole={isCollapsible ? "button" : undefined}
        accessibilityState={isCollapsible ? { expanded: isExpanded } : undefined}
        className="flex-row items-center gap-3"
      >
        <SubmitterAvatar name={submission.submittedByName} />
        <View className="min-w-0 flex-1">
          <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
            {submission.submittedByName}
          </Text>
          <Text className="text-label text-fg-soft">
            Round {submission.round} · {formatSubmissionDateTime(submission.submittedAt)}
            {!isExpanded && attachmentCount > 0 ? ` · ${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}` : ""}
          </Text>
        </View>
        <StatusPill submission={submission} />
        {isCollapsible ? (
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={palette.gray[400]} />
        ) : null}
      </Pressable>

      {isExpanded ? (
        <SubmissionBody
          submission={submission}
          accessToken={accessToken}
          onOpenImage={onOpenImage}
          onOpenFile={onOpenFile}
        />
      ) : null}
    </View>
  );
}

type SubmissionHistoryProps = {
  submissions: TaskSubmissionResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

/** Submitted work for a task: the latest round in full, earlier rounds collapsed. */
export function SubmissionHistory({
  submissions,
  isLoading,
  isError,
  onRetry,
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

  const [latest, ...earlier] = submissions ?? [];

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-body font-semibold text-fg">Submissions</Text>
        {submissions && submissions.length > 0 ? (
          <View className="min-w-[22px] items-center rounded-full bg-subtle px-2 py-0.5">
            <Text className="text-label font-semibold text-fg-sub">{submissions.length}</Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View className="p-4">
          <View className="flex-row items-center gap-3">
            <SkeletonCircle size={36} />
            <View className="flex-1 gap-1.5">
              <SkeletonBlock height={13} className="w-1/2" />
              <SkeletonBlock height={11} className="w-1/3" />
            </View>
          </View>
          <SkeletonBlock height={44} className="mt-3 w-full" />
        </View>
      ) : isError && !latest ? (
        <View className="items-center rounded-xl bg-error-subtle px-5 py-6">
          <Text className="text-body-sm font-semibold text-error">Couldn&apos;t load submissions</Text>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="mt-3 rounded-lg bg-surface px-4 py-2"
          >
            <Text className="text-label font-semibold text-error">Try again</Text>
          </Pressable>
        </View>
      ) : !latest ? (
        <View className="items-center  bg-field px-6 py-7">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
            <Ionicons name="cloud-upload-outline" size={22} color={palette.gray[400]} />
          </View>
          <Text className="mt-3 text-body-sm font-semibold text-fg">No work submitted yet</Text>
          <Text className="mt-1 text-center text-label text-fg-soft">
            Submissions and review feedback will appear here.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          <SubmissionCard
            submission={latest}
            isExpanded
            isCollapsible={false}
            accessToken={accessToken}
            onToggle={() => undefined}
            onOpenImage={setViewerImage}
            onOpenFile={(file) => void openFile(file)}
          />

          {earlier.length > 0 ? (
            <>
              <Text className="mt-1 text-label font-semibold uppercase tracking-[1px] text-fg-faint">
                Earlier rounds
              </Text>
              {earlier.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  isExpanded={expandedIds.has(submission.id)}
                  isCollapsible
                  accessToken={accessToken}
                  onToggle={() => toggle(submission.id)}
                  onOpenImage={setViewerImage}
                  onOpenFile={(file) => void openFile(file)}
                />
              ))}
            </>
          ) : null}
        </View>
      )}

      <ImageViewerModal
        uri={viewerImage?.url ?? null}
        accessToken={accessToken}
        title={viewerImage?.originalName}
        onClose={() => setViewerImage(null)}
      />
    </View>
  );
}
