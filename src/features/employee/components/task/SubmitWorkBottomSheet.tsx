import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { AttachmentPreviewList } from "@/features/employee/components/task/AttachmentPreviewList";
import { AttachmentUploadArea } from "@/features/employee/components/task/AttachmentUploadArea";
import type {
  WorkAttachment,
  WorkUpdatePayload,
} from "@/features/employee/types/workUpdate";
import {
  TASK_STATUS_TRANSITIONS,
  type TaskStatus as RealTaskStatus,
} from "@/features/tasks/types/task.types";

export type SubmitWorkBottomSheetRef = {
  present: (currentStatus: RealTaskStatus) => void;
  dismiss: () => void;
};

type SubmitWorkBottomSheetProps = {
  onSubmit: (payload: WorkUpdatePayload) => Promise<void>;
};

export const SubmitWorkBottomSheet = forwardRef<
  SubmitWorkBottomSheetRef,
  SubmitWorkBottomSheetProps
>(function SubmitWorkBottomSheet({ onSubmit }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["92%"], []);

  const [currentStatus, setCurrentStatus] = useState<RealTaskStatus>("TODO");
  const [update, setUpdate] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<WorkAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Submitting work always moves the task forward to review — the employee
  // no longer picks a status manually.
  const movesToReview = (TASK_STATUS_TRANSITIONS[currentStatus] ?? []).includes(
    "IN_REVIEW"
  );

  const resetForm = useCallback((nextStatus: RealTaskStatus) => {
    setCurrentStatus(nextStatus);
    setUpdate("");
    setNotes("");
    setAttachments([]);
    setSubmitting(false);
  }, []);

  useImperativeHandle(ref, () => ({
    present: (nextStatus: RealTaskStatus) => {
      resetForm(nextStatus);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop(!submitting);

  const canSubmit =
    update.trim().length > 0 ||
    attachments.length > 0 ||
    notes.trim().length > 0;

  const handleAddAttachments = (files: WorkAttachment[]) => {
    setAttachments((prev) => {
      const existing = new Set(prev.map((item) => item.uri));
      const next = files.filter((file) => !existing.has(file.uri));
      return [...prev, ...next];
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        update: update.trim(),
        notes: notes.trim(),
        status: movesToReview ? "IN_REVIEW" : null,
        attachments,
      });
      sheetRef.current?.dismiss();
    } catch {
      // Parent shows the error alert; keep form values for retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!submitting}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <Text className="mb-1 mt-4 text-center text-[18px] font-bold text-[#111827]">
          Submit Work
        </Text>
        <Text className="mb-5 text-center text-[13px] text-[#6B7280]">
          Share progress, attachments, and notes
        </Text>

        <View className="gap-5">
          <View>
            <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              Work update
            </Text>
            <TextInput
              value={update}
              onChangeText={setUpdate}
              placeholder="Write your work update or progress..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              editable={!submitting}
              className="min-h-[120px] rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827]"
              accessibilityLabel="Work update"
            />
            <Text className="mt-1.5 text-[11px] text-[#9CA3AF]">
              Report progress, completed work, blockers, or meeting notes
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              Attachments
            </Text>
            <AttachmentUploadArea onAdd={handleAddAttachments} />
            <AttachmentPreviewList
              attachments={attachments}
              onRemove={(id) =>
                setAttachments((prev) =>
                  prev.filter((item) => item.id !== id)
                )
              }
            />
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              Notes / comments
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add internal notes, comments, or blockers (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              editable={!submitting}
              className="min-h-[88px] rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827]"
              accessibilityLabel="Notes and comments"
            />
          </View>

          <View>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              accessibilityRole="button"
              accessibilityLabel="Submit work update"
              className="flex-row items-center justify-center rounded-2xl py-4"
              style={{
                backgroundColor:
                  !canSubmit || submitting ? "#A7F3A7" : "#32CD32",
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text className="ml-2 text-[16px] font-semibold text-white">
                    Submit Work
                  </Text>
                </>
              )}
            </Pressable>
            {movesToReview ? (
              <Text className="mt-2 text-center text-[11px] text-[#9CA3AF]">
                This will move the task to In Review
              </Text>
            ) : null}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
