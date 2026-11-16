import { useCallback, useState } from "react";


import { getApiErrorMessage } from "@/lib/api";

import { useReviewSubmission } from "./useSubmissions";

import type { TaskSubmissionResponse } from "@/features/tasks/types/submission.types";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { toast } from "@/stores/toastStore";

type TaskReview = {
  isReviewPending: boolean;
  isOwnSubmission: boolean;
  reviewLoading: boolean;
  rejectModalVisible: boolean;
  setRejectModalVisible: (isVisible: boolean) => void;
  /** The approve popup (confirms, and takes an optional comment for the assignee). */
  approveModalVisible: boolean;
  setApproveModalVisible: (isVisible: boolean) => void;
  approve: (comment: string) => Promise<void>;
  reject: (reason: string) => Promise<void>;
};

/**
 * Manager review workflow (approve / reject) for a task.
 *
 * Approve / Reject always go through
 * `POST /tasks/{id}/submissions/{submissionId}/review`, which records the
 * decision on the pending submission and moves the task. A task only reaches
 * review through a work submission; the API refuses IN_REVIEW / APPROVED /
 * REJECTED as plain status changes (409).
 *
 * Approving closes the task (DONE) when the reviewer may close it. Nobody may
 * review their own submission — `isOwnSubmission` tells the screen to hide
 * Approve / Reject.
 */
export function useTaskReview(
  id: string | undefined,
  taskResponse: TaskResponse | undefined,
  pendingSubmission: TaskSubmissionResponse | undefined,
  currentUserId: string | undefined,
): TaskReview {
  const reviewMutation = useReviewSubmission(id ?? "");

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const isReviewPending = taskResponse?.status === "IN_REVIEW";
  const isOwnSubmission = Boolean(
    pendingSubmission && currentUserId && pendingSubmission.submittedById === currentUserId,
  );

  const approve = useCallback(async (comment: string) => {
    if (!taskResponse) return;
    if (!pendingSubmission) {
      toast.warning("Nothing to approve", "This task has no submitted work waiting for review.");
      return;
    }
    setReviewLoading(true);
    try {
      const reviewed = await reviewMutation.mutateAsync({
        submissionId: pendingSubmission.id,
        decision: "APPROVED",
        comment: comment.trim() || undefined,
      });
      setApproveModalVisible(false);
      if (reviewed.taskStatus === "DONE") {
        toast.success("Approved", "The work was approved and the task is now complete.");
      } else {
        toast.success("Approved", "The work was approved. Someone who can close tasks will mark it done.");
      }
    } catch (error) {
      toast.error("Approve failed", getApiErrorMessage(error, "Could not approve this submission."));
    } finally {
      setReviewLoading(false);
    }
  }, [taskResponse, pendingSubmission, reviewMutation]);

  const reject = useCallback(
    async (reason: string) => {
      if (!taskResponse) return;
      if (!pendingSubmission) {
        toast.warning("Nothing to reject", "This task has no submitted work waiting for review.");
        return;
      }
      setReviewLoading(true);
      try {
        await reviewMutation.mutateAsync({
          submissionId: pendingSubmission.id,
          decision: "REJECTED",
          comment: reason,
        });
        setRejectModalVisible(false);
        toast.success("Rejected", "The assignee was notified with your reason.");
      } catch (error) {
        toast.error("Reject failed", getApiErrorMessage(error, "Could not reject this submission."));
      } finally {
        setReviewLoading(false);
      }
    },
    [taskResponse, pendingSubmission, reviewMutation],
  );

  return {
    isReviewPending,
    isOwnSubmission,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approveModalVisible,
    setApproveModalVisible,
    approve,
    reject,
  };
}
