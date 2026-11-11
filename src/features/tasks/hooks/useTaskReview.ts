import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { getApiErrorMessage } from "@/lib/api";

import { useReviewSubmission } from "./useSubmissions";

import type { TaskSubmissionResponse } from "@/features/tasks/types/submission.types";
import type { TaskResponse } from "@/features/tasks/types/task.types";

/**
 * Manager review workflow (approve / reject / mark for review) for a task.
 *
 * Approve / Reject always go through
 * `POST /tasks/{id}/submissions/{submissionId}/review`, which records the
 * decision on the pending submission and moves the task. The API no longer
 * accepts IN_REVIEW / APPROVED / REJECTED as plain status changes (409), so a
 * task only reaches review through a work submission and "Mark for review" is
 * not offered.
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
) {
  const reviewMutation = useReviewSubmission(id ?? "");

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const currentStatus = taskResponse?.status;
  const isReviewPending = currentStatus === "IN_REVIEW";
  // Review is entered only by submitting work (see the hook comment above).
  const canMarkReview = false;
  const isOwnSubmission = Boolean(
    pendingSubmission && currentUserId && pendingSubmission.submittedById === currentUserId,
  );

  const approve = useCallback(async () => {
    if (!taskResponse) return;
    setReviewLoading(true);
    try {
      if (!pendingSubmission) {
        Alert.alert("Nothing to approve", "This task has no submitted work waiting for review.");
        return;
      }
      const reviewed = await reviewMutation.mutateAsync({
        submissionId: pendingSubmission.id,
        decision: "APPROVED",
      });
      if (reviewed.taskStatus === "DONE") {
        Alert.alert("Approved", "The work was approved and the task is now complete.");
      } else {
        Alert.alert("Approved", "The work was approved. Someone who can close tasks will mark it done.");
      }
    } catch (error) {
      Alert.alert("Approve failed", getApiErrorMessage(error, "Could not approve this submission."));
    } finally {
      setReviewLoading(false);
    }
  }, [taskResponse, pendingSubmission, reviewMutation]);

  const reject = useCallback(
    async (reason: string) => {
      if (!taskResponse) return;
      setReviewLoading(true);
      try {
        if (!pendingSubmission) {
          Alert.alert("Nothing to reject", "This task has no submitted work waiting for review.");
          return;
        }
        await reviewMutation.mutateAsync({
          submissionId: pendingSubmission.id,
          decision: "REJECTED",
          comment: reason,
        });
        setRejectModalVisible(false);
        Alert.alert("Rejected", "The assignee was notified with your reason.");
      } catch (error) {
        Alert.alert("Reject failed", getApiErrorMessage(error, "Could not reject this submission."));
      } finally {
        setReviewLoading(false);
      }
    },
    [taskResponse, pendingSubmission, reviewMutation],
  );

  // Kept for the screen's existing wiring; the action is hidden because canMarkReview is false.
  const markForReview = useCallback(async () => {
    Alert.alert("Submit work instead", "A task goes to review when its assignee submits their work.");
  }, []);

  return {
    isReviewPending,
    isOwnSubmission,
    canMarkReview,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approve,
    reject,
    markForReview,
  };
}
