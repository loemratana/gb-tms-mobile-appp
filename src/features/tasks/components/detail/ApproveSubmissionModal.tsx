import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PhraseChips } from "@/features/tasks/components/shared/PhraseChips";
import { SUBMISSION_LIMITS } from "@/features/tasks/types/submission.types";
import { APPROVE_COMMENT_PHRASES } from "@/features/tasks/utils/submissionPhrases";
import { colors } from "@/styles";

type ApproveSubmissionModalProps = {
  visible: boolean;
  taskTitle?: string;
  submitting?: boolean;
  onClose: () => void;
  /** Empty comment = approve without one. */
  onConfirm: (comment: string) => void;
};

/**
 * Confirms an approval (it can close the task and can't be undone) and lets the reviewer add a
 * friendly note for the assignee — one tap on a ready-made Khmer phrase, or their own words.
 */
export function ApproveSubmissionModal({
  visible,
  taskTitle,
  submitting = false,
  onClose,
  onConfirm,
}: ApproveSubmissionModalProps) {
  const [comment, setComment] = useState("");

  // Start empty each time it opens (adjusting state during render).
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setComment("");
  }

  const close = () => {
    if (!submitting) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 items-center justify-center bg-black/55 px-5">
          <Pressable className="absolute inset-0" onPress={close} accessibilityLabel="Cancel" />

          <View className="max-h-[88%] w-full max-w-[380px] overflow-hidden rounded-3xl bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="items-center px-5 pt-6">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-success-subtle">
                  <Ionicons name="checkmark-done" size={28} color={colors.success} />
                </View>
                <Text className="mt-3 text-center text-title font-bold text-fg" accessibilityRole="header">
                  Approve this work?
                </Text>
                {taskTitle ? (
                  <Text className="mt-0.5 py-0.5 text-center text-caption text-fg-soft" numberOfLines={2}>
                    {taskTitle}
                  </Text>
                ) : null}
              </View>

              <View className="mt-5 px-4">
                <Text className="mb-2 text-caption font-semibold text-fg-sub">Say something nice</Text>
                <PhraseChips
                  phrases={APPROVE_COMMENT_PHRASES}
                  selectedPhrase={comment}
                  onPick={setComment}
                  isDisabled={submitting}
                />

                <View className="mb-2 mt-4 flex-row items-center justify-between">
                  <Text className="text-caption font-semibold text-fg-sub">
                    Comment <Text className="font-normal text-fg-faint">(optional)</Text>
                  </Text>
                  <Text className="text-label text-fg-faint">
                    {`${comment.length}/${SUBMISSION_LIMITS.maxReviewCommentLength}`}
                  </Text>
                </View>
                <TextField
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Pick a phrase above or write your own…"
                  multiline
                  maxLength={SUBMISSION_LIMITS.maxReviewCommentLength}
                  editable={!submitting}
                  accessibilityLabel="Approval comment"
                />
                <Text className="mt-1.5 px-1 text-label text-fg-faint">
                  The assignee is notified and sees your comment. Approving can&apos;t be undone.
                </Text>
              </View>

              <View className="flex-row gap-3 p-4 pt-5">
                <View className="flex-1">
                  <Button label="Cancel" variant="secondary" disabled={submitting} onPress={close} />
                </View>
                <View className="flex-1">
                  <Button
                    label="Approve"
                    icon="checkmark"
                    variant="success"
                    isLoading={submitting}
                    onPress={() => onConfirm(comment.trim())}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
