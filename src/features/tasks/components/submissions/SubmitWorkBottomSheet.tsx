import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { UncontrolledTextInput } from "@/components/ui/UncontrolledTextInput";
import {
  SheetHeader,
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { AttachmentPreviewList } from "./AttachmentPreviewList";
import { AttachmentUploadArea } from "./AttachmentUploadArea";
import { SUBMISSION_LIMITS } from "@/features/tasks/types/submission.types";
import {
  TASK_STATUS_TRANSITIONS,
  type TaskStatus as ApiTaskStatus,
} from "@/features/tasks/types/task.types";
import type { WorkAttachment, WorkUpdatePayload } from "@/features/tasks/types/workUpdate.types";
import { palette } from "@/styles";

export type SubmitWorkBottomSheetRef = {
  present: (currentStatus: ApiTaskStatus) => void;
  dismiss: () => void;
};

type SubmitWorkBottomSheetProps = {
  onSubmit: (payload: WorkUpdatePayload) => Promise<void>;
};

function SectionLabel({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-caption font-semibold text-fg-sub">{title}</Text>
      {trailing ? <Text className="text-label text-fg-faint">{trailing}</Text> : null}
    </View>
  );
}

/** Work submission form: one note plus images / files, sent for review in a single request. */
export const SubmitWorkBottomSheet = forwardRef<SubmitWorkBottomSheetRef, SubmitWorkBottomSheetProps>(
  function SubmitWorkBottomSheet({ onSubmit }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["92%"], []);

    const [currentStatus, setCurrentStatus] = useState<ApiTaskStatus>("TODO");
    const [note, setNote] = useState("");
    const [attachments, setAttachments] = useState<WorkAttachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The server starts a TODO or REJECTED task on the way, so those reach review in the same call.
    const movesToReview =
      currentStatus === "TODO" ||
      currentStatus === "REJECTED" ||
      (TASK_STATUS_TRANSITIONS[currentStatus] ?? []).includes("IN_REVIEW");

    const imageCount = attachments.filter((item) => item.kind === "image").length;
    const fileCount = attachments.length - imageCount;
    const isAtAttachmentLimit =
      imageCount >= SUBMISSION_LIMITS.maxImages && fileCount >= SUBMISSION_LIMITS.maxFiles;
    const canSubmit = (note.trim().length > 0 || attachments.length > 0) && !isSubmitting;

    useImperativeHandle(ref, () => ({
      present: (nextStatus) => {
        setCurrentStatus(nextStatus);
        setNote("");
        setAttachments([]);
        setIsSubmitting(false);
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useSheetBackdrop(!isSubmitting);

    const handleAddAttachments = (files: WorkAttachment[]) => {
      setAttachments((previous) => {
        const existing = new Set(previous.map((item) => item.uri));
        return [...previous, ...files.filter((file) => !existing.has(file.uri))];
      });
    };

    const handleSubmit = useCallback(async () => {
      if (!canSubmit) return;
      setIsSubmitting(true);
      try {
        await onSubmit({ note, attachments });
        sheetRef.current?.dismiss();
      } catch {
        // The hook already showed an alert; keep the form filled in for a retry.
      } finally {
        setIsSubmitting(false);
      }
    }, [canSubmit, onSubmit, note, attachments]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={!isSubmitting}
        // Keep the sheet where it is when the keyboard opens (it's already near
        // full height); "interactive" pushed its top under the status bar.
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        topInset={insets.top}
        backdropComponent={renderBackdrop}
        backgroundStyle={sheetBackgroundStyle}
        handleIndicatorStyle={sheetHandleIndicatorStyle}
      >
        <View style={{ flex: 1 }}>
          <View className="px-5 pt-1">
            <SheetHeader
              title="Submit work"
              subtitle="Describe what you did and attach any proof"
              onClose={isSubmitting ? undefined : () => sheetRef.current?.dismiss()}
            />
          </View>

          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          >

          {movesToReview ? (
            <View className="mb-5 flex-row items-center gap-2 rounded-xl bg-brand-subtle px-3 py-2.5">
              <Ionicons name="information-circle" size={18} color={palette.blue[600]} />
              <Text className="flex-1 text-label leading-[17px] text-brand-strong">
                Submitting moves this task to In Review until it&apos;s approved or rejected.
              </Text>
            </View>
          ) : null}

          <SectionLabel
            title="What did you do?"
            trailing={`${note.length}/${SUBMISSION_LIMITS.maxNoteLength}`}
          />
          <UncontrolledTextInput
            isInBottomSheet
            value={note}
            onChangeText={setNote}
            placeholder="Summarise the work, results, or anything the reviewer should know…"
            placeholderTextColor={palette.gray[400]}
            multiline
            textAlignVertical="top"
            maxLength={SUBMISSION_LIMITS.maxNoteLength}
            editable={!isSubmitting}
            accessibilityLabel="Work note"
            style={{
              minHeight: 120,
              maxHeight: 200,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.gray[200],
              backgroundColor: palette.gray[50],
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              // No fixed lineHeight: Khmer stacks subscripts and vowels above/below the
              // line, and a tight fixed height clips them. Let the font decide.
              color: palette.gray[900],
            }}
          />

          <View className="mt-6">
            <SectionLabel
              title="Attachments"
              trailing={`${imageCount}/${SUBMISSION_LIMITS.maxImages} images · ${fileCount}/${SUBMISSION_LIMITS.maxFiles} files`}
            />
            <AttachmentUploadArea
              onAdd={handleAddAttachments}
              isDisabled={isSubmitting || isAtAttachmentLimit}
            />
            <AttachmentPreviewList
              attachments={attachments}
              onRemove={(id) => setAttachments((previous) => previous.filter((item) => item.id !== id))}
            />
          </View>
          </BottomSheetScrollView>

          <View
            className="border-t border-line-soft bg-surface px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <Button
              label="Submit for review"
              icon="paper-plane"
              isLoading={isSubmitting}
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
            />
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);
