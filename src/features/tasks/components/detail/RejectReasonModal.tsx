import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SUBMISSION_LIMITS } from "@/features/tasks/types/submission.types";
import { colors } from "@/styles";

type RejectReasonModalProps = {
  visible: boolean;
  taskTitle?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const MIN_REASON_LENGTH = 5;

/**
 * Asks the reviewer what needs fixing before a submission is rejected. A centered popup with a
 * standard text input rather than a bottom sheet: the sheet's input lost the keyboard on iPhone,
 * so no reason could be typed and Reject could never go through.
 */
export function RejectReasonModal({
  visible,
  taskTitle,
  submitting = false,
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Start empty each time it opens (adjusting state during render).
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setReason("");
      setError("");
    }
  }

  const close = () => {
    if (!submitting) onClose();
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError(`Tell the assignee what to fix (at least ${MIN_REASON_LENGTH} characters).`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 items-center justify-center bg-black/55 px-5">
          <Pressable className="absolute inset-0" onPress={close} accessibilityLabel="Cancel" />

          <View className="max-h-[88%] w-full max-w-[380px] overflow-hidden rounded-3xl bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="items-center px-5 pt-6">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-error-subtle">
                  <Ionicons name="arrow-undo" size={26} color={colors.danger} />
                </View>
                <Text className="mt-3 text-center text-title font-bold text-fg" accessibilityRole="header">
                  Reject submission
                </Text>
                {taskTitle ? (
                  <Text className="mt-0.5 py-0.5 text-center text-caption text-fg-soft" numberOfLines={2}>
                    {taskTitle}
                  </Text>
                ) : null}
              </View>

              <View className="mt-5 px-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-caption font-semibold text-fg-sub">What needs to be fixed?</Text>
                  <Text className="text-label text-fg-faint">
                    {`${reason.length}/${SUBMISSION_LIMITS.maxReviewCommentLength}`}
                  </Text>
                </View>
                <TextField
                  value={reason}
                  onChangeText={(text) => {
                    setReason(text);
                    if (error) setError("");
                  }}
                  placeholder="Explain what the assignee should change…"
                  multiline
                  maxLength={SUBMISSION_LIMITS.maxReviewCommentLength}
                  editable={!submitting}
                  accessibilityLabel="Reason for rejection"
                  error={error || undefined}
                />
                {error ? null : (
                  <Text className="mt-1.5 px-1 text-label text-fg-faint">
                    The assignee sees this reason and can resubmit.
                  </Text>
                )}
              </View>

              <View className="flex-row gap-3 p-4 pt-5">
                <View className="flex-1">
                  <Button label="Cancel" variant="secondary" disabled={submitting} onPress={close} />
                </View>
                <View className="flex-1">
                  <Button label="Reject" variant="destructive" isLoading={submitting} onPress={handleConfirm} />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
