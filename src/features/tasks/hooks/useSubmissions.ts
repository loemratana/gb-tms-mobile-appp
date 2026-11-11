import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { invalidateTaskListsAndSummaries, taskKeys } from "./useTasks";
import type {
  ReviewSubmissionRequest,
  SubmissionListParams,
  SubmitWorkRequest,
} from "@/features/tasks/types/submission.types";
import {
  listMySubmissions,
  listPendingReviewSubmissions,
  listTaskSubmissions,
  reviewTaskSubmission,
  submitTaskWork,
} from "@/services/submissions.service";

/** Cross-task submission lists (`/submissions/me`, `/submissions/pending-review`). */
export const submissionKeys = {
  all: ["submissions"] as const,
  mine: (params: SubmissionListParams) => [...submissionKeys.all, "me", params] as const,
  pendingReview: (params: SubmissionListParams) =>
    [...submissionKeys.all, "pending-review", params] as const,
};

/** A submission or review changes the task's status, so refresh it everywhere it's shown. */
function invalidateAfterSubmissionChange(queryClient: QueryClient, taskId: string) {
  void queryClient.invalidateQueries({ queryKey: taskKeys.submissions(taskId) });
  void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId), exact: true });
  invalidateTaskListsAndSummaries(queryClient);
  void queryClient.invalidateQueries({ queryKey: submissionKeys.all });
}

export function useTaskSubmissions(taskId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.submissions(taskId ?? ""),
    queryFn: () => listTaskSubmissions(taskId as string),
    enabled: Boolean(taskId),
  });
}

/** The current user's submissions across all tasks, optionally filtered by status. */
export function useMySubmissions(params: SubmissionListParams = {}) {
  return useQuery({
    queryKey: submissionKeys.mine(params),
    queryFn: () => listMySubmissions(params),
  });
}

/** Submissions waiting for the current user's review. Off for users who can't review. */
export function usePendingReviewSubmissions(params: SubmissionListParams = {}, enabled = true) {
  return useQuery({
    queryKey: submissionKeys.pendingReview(params),
    queryFn: () => listPendingReviewSubmissions(params),
    enabled,
  });
}

export function useSubmitTaskWork(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitWorkRequest) => submitTaskWork(taskId, request),
    onSuccess: () => invalidateAfterSubmissionChange(queryClient, taskId),
  });
}

export function useReviewSubmission(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, ...request }: ReviewSubmissionRequest & { submissionId: string }) =>
      reviewTaskSubmission(taskId, submissionId, request),
    onSuccess: () => invalidateAfterSubmissionChange(queryClient, taskId),
  });
}
