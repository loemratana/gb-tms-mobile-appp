import { useCallback } from "react";
import { Alert } from "react-native";

import { useSubmitTaskWork } from "./useSubmissions";
import {
  SUBMISSION_LIMITS,
  type SubmissionUploadFile,
} from "@/features/tasks/types/submission.types";
import type { WorkUpdatePayload } from "@/features/tasks/types/workUpdate.types";
import { getApiErrorMessage } from "@/lib/api";

type SubmitWork = {
  submitWork: (payload: WorkUpdatePayload) => Promise<void>;
  isSubmitting: boolean;
};

/**
 * Sends a work submission (`POST /tasks/{id}/submissions`): note, images and
 * files in one request. The server moves the task to In Review. Shared by the
 * employee and manager views of the task detail screen.
 */
export function useSubmitWork(taskId: string | undefined): SubmitWork {
  const submitMutation = useSubmitTaskWork(taskId ?? "");

  const submitWork = useCallback(
    async (payload: WorkUpdatePayload) => {
      const toUpload = (kind: "image" | "document"): SubmissionUploadFile[] =>
        payload.attachments
          .filter((attachment) => attachment.kind === kind)
          .map(({ uri, name, mimeType }) => ({ uri, name, mimeType }));
      const images = toUpload("image");
      const files = toUpload("document");
      const note = payload.note.trim();

      // Mirror the server's limits so the user gets a clear message before uploading.
      if (images.length > SUBMISSION_LIMITS.maxImages || files.length > SUBMISSION_LIMITS.maxFiles) {
        Alert.alert(
          "Too many attachments",
          `You can attach up to ${SUBMISSION_LIMITS.maxImages} images and ${SUBMISSION_LIMITS.maxFiles} files.`,
        );
        throw new Error("too many attachments");
      }
      if (note.length > SUBMISSION_LIMITS.maxNoteLength) {
        Alert.alert(
          "Note is too long",
          `Keep your note under ${SUBMISSION_LIMITS.maxNoteLength} characters.`,
        );
        throw new Error("note too long");
      }

      try {
        await submitMutation.mutateAsync({ note: note || undefined, images, files });
      } catch (error) {
        Alert.alert("Couldn't submit", getApiErrorMessage(error, "Please try again."));
        // Rethrow so the sheet stays open with the form intact for a retry.
        throw error;
      }

      Alert.alert("Work submitted", "Your work was sent for review.");
    },
    [submitMutation],
  );

  return { submitWork, isSubmitting: submitMutation.isPending };
}
