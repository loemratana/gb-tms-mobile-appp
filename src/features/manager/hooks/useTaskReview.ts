import { useCallback, useState } from "react";
import { Alert } from "react-native";

import {
  useAddTaskComment,
  useChangeTaskStatus,
} from "@/features/tasks/hooks/useTaskMutations";
import {
  TASK_STATUS_TRANSITIONS,
  type TaskResponse,
} from "@/features/tasks/types/task.types";

/**
 * Encapsulates the manager review workflow (approve / reject / mark for
 * review) for a task, deriving what's currently allowed from the same
 * server-enforced `TASK_STATUS_TRANSITIONS` map the employee submit flow uses.
 */
export function useTaskReview(id: string | undefined, taskResponse: TaskResponse | undefined) {
  const changeStatusMutation = useChangeTaskStatus(id ?? "");
  const addCommentMutation = useAddTaskComment(id ?? "");

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const currentStatus = taskResponse?.status;
  const allowedTransitions = currentStatus ? TASK_STATUS_TRANSITIONS[currentStatus] : [];
  const isReviewPending = currentStatus === "IN_REVIEW";
  const canMarkReview = allowedTransitions.includes("IN_REVIEW");

  const approve = useCallback(async () => {
    if (!taskResponse) return;
    setReviewLoading(true);
    try {
      await changeStatusMutation.mutateAsync("APPROVED");
      Alert.alert("Approved", "Task marked as done.");
    } catch {
      Alert.alert("Approve failed", "Could not approve this submission.");
    } finally {
      setReviewLoading(false);
    }
  }, [taskResponse, changeStatusMutation]);

  const reject = useCallback(
    async (reason: string) => {
      if (!taskResponse) return;
      setReviewLoading(true);
      try {
        await addCommentMutation.mutateAsync({ content: `Rejected: ${reason}` });
        await changeStatusMutation.mutateAsync("REJECTED");
        setRejectModalVisible(false);
        Alert.alert("Rejected", "The employee was notified with your reason.");
      } catch {
        Alert.alert("Reject failed", "Could not reject this submission.");
      } finally {
        setReviewLoading(false);
      }
    },
    [taskResponse, addCommentMutation, changeStatusMutation],
  );

  const markForReview = useCallback(async () => {
    if (!taskResponse) return;
    try {
      await changeStatusMutation.mutateAsync("IN_REVIEW");
      Alert.alert("Marked for review", "This task is now awaiting review.");
    } catch {
      Alert.alert("Update failed", "Could not mark this task for review.");
    }
  }, [taskResponse, changeStatusMutation]);

  return {
    isReviewPending,
    canMarkReview,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approve,
    reject,
    markForReview,
  };
}
