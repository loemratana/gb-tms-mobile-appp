import { useCallback } from "react";


import { useSubmitTaskWork } from "./useSubmissions";
import {
  SUBMISSION_LIMITS,
  type SubmissionUploadFile,
} from "@/features/tasks/types/submission.types";
import type { WorkUpdatePayload } from "@/features/tasks/types/workUpdate.types";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "@/stores/toastStore";

/**
 * The server refused the submission because it's past the due date and has no reason. The sheet
 * catches this to ask for one, instead of showing an error (e.g. the task became late after the
 * screen was opened, so the app didn't know to ask).
 */
export class LateReasonRequiredError extends Error {
  constructor() {
    super("A reason is required for a late submission.");
    this.name = "LateReasonRequiredError";
  }
}

/** Matches the server's message: "…Please provide a reason for the late submission." */
const LATE_REASON_REQUIRED_PATTERN = /reason for the late submission/i;

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
      const lateReason = payload.lateReason?.trim() ?? "";

      // Mirror the server's limits so the user gets a clear message before uploading. (Note and
      // reason lengths are already capped by the inputs' maxLength.)
      if (images.length > SUBMISSION_LIMITS.maxImages || files.length > SUBMISSION_LIMITS.maxFiles) {
        toast.warning(
          "Too many attachments",
          `You can attach up to ${SUBMISSION_LIMITS.maxImages} images and ${SUBMISSION_LIMITS.maxFiles} files.`,
        );
        throw new Error("too many attachments");
      }

      try {
        await submitMutation.mutateAsync({
          note: note || undefined,
          lateReason: lateReason || undefined,
          images,
          files,
        });
      } catch (error) {
        const message = getApiErrorMessage(error, "Please try again.");
        if (!lateReason && LATE_REASON_REQUIRED_PATTERN.test(message)) {
          throw new LateReasonRequiredError();
        }
        toast.error("Couldn't submit", message);
        // Rethrow so the sheet stays open with the form intact for a retry.
        throw error;
      }

      toast.success("Work submitted", "Your work was sent for review.");
    },
    [submitMutation],
  );

  return { submitWork, isSubmitting: submitMutation.isPending };
}
