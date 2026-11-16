import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StackHeader } from "@/components/layout/StackHeader";
import { FormField } from "@/components/ui/FormField";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { TextField } from "@/components/ui/TextField";
import { PhraseChips } from "@/features/tasks/components/shared/PhraseChips";
import { AttachmentPreviewList } from "@/features/tasks/components/submissions/AttachmentPreviewList";
import { AttachmentUploadArea } from "@/features/tasks/components/submissions/AttachmentUploadArea";
import { LateReasonPopup } from "@/features/tasks/components/submissions/LateReasonPopup";
import { useSubmitWorkForm } from "@/features/tasks/hooks/useSubmitWorkForm";
import { SUBMISSION_LIMITS } from "@/features/tasks/types/submission.types";
import { WORK_NOTE_PHRASES } from "@/features/tasks/utils/submissionPhrases";
import { colors, palette } from "@/styles";

const FLOATING_SHADOW = Platform.select({
  ios: { shadowColor: palette.blue[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  android: { elevation: 4 },
});

function formatDueDate(value: string): string {
  // Date-only "YYYY-MM-DD": build it in local time so it isn't shifted a day by UTC parsing.
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Notice({
  icon,
  tone,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: "info" | "error" | "neutral";
  children: ReactNode;
}) {
  const style = {
    info: { bg: "bg-brand-subtle", color: colors.brand },
    error: { bg: "bg-error-subtle", color: colors.danger },
    neutral: { bg: "bg-field", color: colors.textMuted },
  }[tone];
  return (
    <View className={`mt-3 flex-row items-start gap-2 rounded-xl px-3 py-2.5 ${style.bg}`}>
      <Ionicons name={icon} size={18} color={style.color} style={{ marginTop: 1 }} />
      <View className="min-w-0 flex-1">{children}</View>
    </View>
  );
}

/**
 * Submit work for a task: what was done, proof (photos / files), and — when late — why. A full
 * screen rather than a bottom sheet so the keyboard behaves like any other form on iPhone.
 */
export default function SubmitWorkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const form = useSubmitWorkForm(id);
  const dueDateLabel = form.task?.dueDate ? formatDueDate(form.task.dueDate) : undefined;

  if (form.isLoadingTask || !form.task) {
    return (
      <View className="flex-1 bg-surface">
        <StackHeader title="Submit work" onBack={() => router.back()} />
        {form.isTaskError ? (
          <View className="flex-1 justify-center px-4">
            <StateView
              variant="error"
              title="Couldn't load this task"
              message="Check your connection and try again."
              actionLabel="Try again"
              onPressAction={form.refetchTask}
            />
          </View>
        ) : (
          <View className="gap-3 p-4">
            <SkeletonBlock height={16} className="w-2/3" />
            <SkeletonBlock height={120} radius={12} className="w-full" />
            <SkeletonBlock height={64} radius={12} className="w-full" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <StackHeader title="Submit work" onBack={() => router.back()} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
        >
          {/* Which task this is for. No fixed line height: titles may be Khmer. */}
          <Text className="text-label font-semibold uppercase tracking-wider text-fg-faint">Task</Text>
          <Text className="mt-1 py-0.5 text-headline font-bold text-fg" numberOfLines={2}>
            {form.task.title}
          </Text>

          {form.movesToReview ? (
            <Notice icon="information-circle" tone="info">
              <Text className="text-label text-brand-strong">
                Submitting moves this task to In Review until it&apos;s approved or rejected.
              </Text>
            </Notice>
          ) : null}

          {form.isLate ? (
            <Notice icon="alert-circle" tone="error">
              <Text className="text-label text-error-fg">
                This task was due {dueDateLabel ?? "earlier"}.{" "}
                {form.lateReason ? "Your reason:" : "You'll be asked why it's late when you submit."}
              </Text>
              {form.lateReason ? (
                <View className="mt-1 flex-row items-start gap-2">
                  <Text className="flex-1 py-0.5 text-caption font-medium text-error-fg">{form.lateReason}</Text>
                  <Pressable
                    onPress={form.openLatePopup}
                    disabled={form.isSubmitting}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Change the late reason"
                  >
                    <Text className="text-label font-semibold text-brand-strong">Change</Text>
                  </Pressable>
                </View>
              ) : null}
            </Notice>
          ) : null}

          {form.isDraftRestored ? (
            <Notice icon="document-text-outline" tone="neutral">
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-label text-fg-soft">Restored your unsent note.</Text>
                <Pressable
                  onPress={form.clearDraft}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear the restored draft"
                >
                  <Text className="text-label font-semibold text-brand-strong">Clear</Text>
                </Pressable>
              </View>
            </Notice>
          ) : null}

          <FormField
            label="What did you do?"
            action={
              <Text className="text-label text-fg-faint">{`${form.note.length}/${SUBMISSION_LIMITS.maxNoteLength}`}</Text>
            }
          >
            <TextField
              value={form.note}
              onChangeText={form.setNote}
              placeholder="Summarise the work, results, or anything the reviewer should know…"
              multiline
              maxLength={SUBMISSION_LIMITS.maxNoteLength}
              editable={!form.isSubmitting}
              accessibilityLabel="Work note"
            />
            <Text className="mb-2 mt-3 text-label font-medium text-fg-soft">Tap to add a phrase</Text>
            <PhraseChips phrases={WORK_NOTE_PHRASES} onPick={form.addPhrase} isDisabled={form.isSubmitting} />
          </FormField>

          <FormField
            label="Attachments"
            isOptional
            action={
              <Text className="text-label text-fg-faint">
                {`${form.imageCount}/${SUBMISSION_LIMITS.maxImages} images · ${form.fileCount}/${SUBMISSION_LIMITS.maxFiles} files`}
              </Text>
            }
          >
            <AttachmentUploadArea onAdd={form.addAttachments} isDisabled={form.isSubmitting || form.isAtAttachmentLimit} />
            <AttachmentPreviewList attachments={form.attachments} onRemove={form.removeAttachment} />
          </FormField>
        </ScrollView>

        <View className="px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Pressable
            onPress={form.submit}
            disabled={!form.canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Submit for review"
            accessibilityState={{ disabled: !form.canSubmit, busy: form.isSubmitting }}
            className={`h-[52px] flex-row items-center justify-center gap-2 rounded-full ${
              form.canSubmit || form.isSubmitting ? "bg-brand active:opacity-85" : "bg-subtle"
            }`}
            style={form.canSubmit ? FLOATING_SHADOW : undefined}
          >
            {form.isSubmitting ? (
              <ActivityIndicator size="small" color={palette.white} />
            ) : (
              <>
                <Ionicons name="paper-plane" size={17} color={form.canSubmit ? palette.white : palette.gray[400]} />
                <Text className={`text-body font-semibold ${form.canSubmit ? "text-white" : "text-fg-faint"}`}>
                  Submit for review
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <LateReasonPopup
        visible={form.isLatePopupVisible}
        dueDateLabel={dueDateLabel}
        initialReason={form.lateReason}
        maxLength={SUBMISSION_LIMITS.maxLateReasonLength}
        onCancel={form.closeLatePopup}
        onConfirm={form.confirmLateReason}
      />
    </View>
  );
}
