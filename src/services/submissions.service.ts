import type {
  ReviewSubmissionRequest,
  SubmissionListParams,
  SubmissionUploadFile,
  SubmitWorkRequest,
  TaskSubmissionResponse,
} from "@/features/tasks/types/submission.types";
import type { PageResponse } from "@/features/tasks/types/task.types";
import { api, type ApiEnvelope } from "@/lib/api";

function appendFile(formData: FormData, field: string, file: SubmissionUploadFile) {
  // React Native's FormData takes a { uri, name, type } descriptor rather than a Blob.
  formData.append(field, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
}

/**
 * Submits work for a task in one multipart request (`note`, repeated `images`,
 * repeated `files`). The server moves the task to IN_REVIEW, starting a TODO
 * or REJECTED task automatically on the way.
 */
export async function submitTaskWork(
  taskId: string,
  request: SubmitWorkRequest,
): Promise<TaskSubmissionResponse> {
  const formData = new FormData();
  if (request.note) formData.append("note", request.note);
  request.images.forEach((image) => appendFile(formData, "images", image));
  request.files.forEach((file) => appendFile(formData, "files", file));

  const { data } = await api.post<ApiEnvelope<TaskSubmissionResponse>>(
    `/tasks/${taskId}/submissions`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}

/** All submissions for a task, newest first. */
export async function listTaskSubmissions(taskId: string): Promise<TaskSubmissionResponse[]> {
  const { data } = await api.get<ApiEnvelope<TaskSubmissionResponse[]>>(
    `/tasks/${taskId}/submissions`,
  );
  return data.data;
}

export async function getTaskSubmission(
  taskId: string,
  submissionId: string,
): Promise<TaskSubmissionResponse> {
  const { data } = await api.get<ApiEnvelope<TaskSubmissionResponse>>(
    `/tasks/${taskId}/submissions/${submissionId}`,
  );
  return data.data;
}

/** The current user's submissions across all tasks, newest first. */
export async function listMySubmissions(
  params: SubmissionListParams = {},
): Promise<PageResponse<TaskSubmissionResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<TaskSubmissionResponse>>>(
    "/submissions/me",
    { params },
  );
  return data.data;
}

/**
 * PENDING submissions the current user may review (every department or their
 * own, by permission), oldest first. Never includes their own submissions.
 */
export async function listPendingReviewSubmissions(
  params: Omit<SubmissionListParams, "status"> = {},
): Promise<PageResponse<TaskSubmissionResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<TaskSubmissionResponse>>>(
    "/submissions/pending-review",
    { params },
  );
  return data.data;
}

/**
 * Approves or rejects a pending submission. Rejecting moves the task to
 * REJECTED; approving moves it to DONE when the reviewer may close tasks,
 * otherwise APPROVED. Reviewing your own submission is refused with 403.
 */
export async function reviewTaskSubmission(
  taskId: string,
  submissionId: string,
  request: ReviewSubmissionRequest,
): Promise<TaskSubmissionResponse> {
  const { data } = await api.post<ApiEnvelope<TaskSubmissionResponse>>(
    `/tasks/${taskId}/submissions/${submissionId}/review`,
    request,
  );
  return data.data;
}
