import { usePreventRemove, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useSubmissionDraft } from "@/features/tasks/hooks/useSubmissionDraft";
import { LateReasonRequiredError, useSubmitWork } from "@/features/tasks/hooks/useSubmitWork";
import { useTask } from "@/features/tasks/hooks/useTasks";
import { SUBMISSION_LIMITS } from "@/features/tasks/types/submission.types";
import { TASK_STATUS_TRANSITIONS } from "@/features/tasks/types/task.types";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import type { WorkAttachment } from "@/features/tasks/types/workUpdate.types";
import { appendPhrase } from "@/features/tasks/utils/submissionPhrases";

type SubmitWorkForm = {
  task: TaskResponse | undefined;
  isLoadingTask: boolean;
  isTaskError: boolean;
  refetchTask: () => void;
  /** Submitting will move the task to In Review (TODO / REJECTED are started on the way). */
  movesToReview: boolean;
  /** Past the due date: the server requires a reason. */
  isLate: boolean;
  note: string;
  setNote: (text: string) => void;
  /** Adds a ready-made phrase to the note, on its own line. */
  addPhrase: (phrase: string) => void;
  isDraftRestored: boolean;
  clearDraft: () => void;
  attachments: WorkAttachment[];
  addAttachments: (files: WorkAttachment[]) => void;
  removeAttachment: (id: string) => void;
  imageCount: number;
  fileCount: number;
  isAtAttachmentLimit: boolean;
  lateReason: string;
  isLatePopupVisible: boolean;
  openLatePopup: () => void;
  closeLatePopup: () => void;
  confirmLateReason: (reason: string) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submit: () => void;
};

/**
 * The Submit Work screen's state: note, attachments, late reason (asked in a popup), the unsent
 * draft, and sending. Leaving with picked attachments asks first; the typed text is kept as a draft.
 */
export function useSubmitWorkForm(taskId: string | undefined): SubmitWorkForm {
  const router = useRouter();
  const taskQuery = useTask(taskId);
  const task = taskQuery.data;
  const { submitWork } = useSubmitWork(taskId);
  const draft = useSubmissionDraft(taskId);

  const [note, setNoteState] = useState("");
  const [lateReason, setLateReason] = useState("");
  const [attachments, setAttachments] = useState<WorkAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [isLatePopupVisible, setIsLatePopupVisible] = useState(false);
  // The server said it's late although the task didn't say so (it became late while open).
  const [isLateFromServer, setIsLateFromServer] = useState(false);
  // A draft that loads after the first keystroke must not replace what's being typed.
  const hasTypedRef = useRef(false);

  // Restore the unsent note from storage once, when the screen opens.
  const { load } = draft;
  useEffect(() => {
    let isCancelled = false;
    void load().then((saved) => {
      if (!saved || isCancelled || hasTypedRef.current) return;
      setNoteState(saved.note);
      setLateReason(saved.lateReason);
      setIsDraftRestored(true);
    });
    return () => {
      isCancelled = true;
    };
  }, [load]);

  const status = task?.status ?? "TODO";
  const movesToReview =
    status === "TODO" || status === "REJECTED" || (TASK_STATUS_TRANSITIONS[status] ?? []).includes("IN_REVIEW");
  const isLate = Boolean(task?.overdue) || isLateFromServer;

  const imageCount = attachments.filter((item) => item.kind === "image").length;
  const fileCount = attachments.length - imageCount;
  const isAtAttachmentLimit =
    imageCount >= SUBMISSION_LIMITS.maxImages && fileCount >= SUBMISSION_LIMITS.maxFiles;
  const hasContent = note.trim().length > 0 || attachments.length > 0;
  const canSubmit = hasContent && !isSubmitting && Boolean(task);

  // Picked files can't be kept as a draft, so leaving with some asks first.
  usePreventRemove(attachments.length > 0 && !isSubmitting, ({ repeat }) => {
    Alert.alert("Leave without submitting?", "Your note is kept as a draft, but you'll need to add the attachments again.", [
      { text: "Stay", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: repeat },
    ]);
  });

  const setNote = (text: string) => {
    hasTypedRef.current = true;
    setNoteState(text);
    draft.scheduleSave({ note: text, lateReason });
  };

  const addPhrase = (phrase: string) => {
    const next = appendPhrase(note, phrase);
    if (next.length > SUBMISSION_LIMITS.maxNoteLength) return;
    setNote(next);
  };

  const clearDraft = () => {
    setNoteState("");
    setLateReason("");
    setIsDraftRestored(false);
    void draft.clear();
  };

  const submitWith = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await submitWork({ note, attachments, lateReason: reason.trim() || undefined });
      await draft.clear();
      router.back();
    } catch (error) {
      if (error instanceof LateReasonRequiredError) {
        // It became late after the task loaded: ask now instead of showing an error.
        setIsLateFromServer(true);
        setIsLatePopupVisible(true);
      }
      // Otherwise the hook already showed an alert; keep the form filled in for a retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = () => {
    if (!canSubmit) return;
    if (isLate && !lateReason.trim()) {
      setIsLatePopupVisible(true);
      return;
    }
    void submitWith(isLate ? lateReason : "");
  };

  const confirmLateReason = (reason: string) => {
    setLateReason(reason);
    draft.scheduleSave({ note, lateReason: reason });
    setIsLatePopupVisible(false);
    void submitWith(reason);
  };

  return {
    task,
    isLoadingTask: taskQuery.isLoading,
    isTaskError: taskQuery.isError,
    refetchTask: () => void taskQuery.refetch(),
    movesToReview,
    isLate,
    note,
    setNote,
    addPhrase,
    isDraftRestored,
    clearDraft,
    attachments,
    addAttachments: (files) =>
      setAttachments((previous) => {
        const existing = new Set(previous.map((item) => item.uri));
        return [...previous, ...files.filter((file) => !existing.has(file.uri))];
      }),
    removeAttachment: (id) => setAttachments((previous) => previous.filter((item) => item.id !== id)),
    imageCount,
    fileCount,
    isAtAttachmentLimit,
    lateReason,
    isLatePopupVisible,
    openLatePopup: () => setIsLatePopupVisible(true),
    closeLatePopup: () => setIsLatePopupVisible(false),
    confirmLateReason,
    canSubmit,
    isSubmitting,
    submit,
  };
}
