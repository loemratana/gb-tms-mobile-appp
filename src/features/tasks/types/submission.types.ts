/** Mirrors the API's `SubmissionStatus`. */
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SubmissionFileKind = "IMAGE" | "FILE";

export type SubmissionDecision = "APPROVED" | "REJECTED";

/** One uploaded image or file. `url` is a signed, short-lived link. */
export type SubmissionFileResponse = {
  id: string;
  kind: SubmissionFileKind;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
};

/** GET/POST `/tasks/{taskId}/submissions` item, also used by `/submissions/me` and `/submissions/pending-review`. */
export type TaskSubmissionResponse = {
  id: string;
  taskId: string;
  taskTitle: string;
  /** The task's current API status, e.g. "DONE" once an approval closed it. */
  taskStatus: string;
  /** 1 for the first submission, then 2, 3… after each rejection. */
  round: number;
  note: string | null;
  status: SubmissionStatus;
  submittedById: string;
  submittedByName: string;
  submittedAt: string;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  images: SubmissionFileResponse[];
  files: SubmissionFileResponse[];
};

/** A picked local file, ready to go into the multipart body. */
export type SubmissionUploadFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export type SubmitWorkRequest = {
  note?: string;
  images: SubmissionUploadFile[];
  files: SubmissionUploadFile[];
};

export type ReviewSubmissionRequest = {
  decision: SubmissionDecision;
  /** Required by the API when rejecting. */
  comment?: string;
};

/** Query params for the paged `/submissions/me` and `/submissions/pending-review` lists. */
export type SubmissionListParams = {
  /** Only used by `/submissions/me`. */
  status?: SubmissionStatus;
  page?: number;
  size?: number;
};

/** Server-side limits from `SubmitWorkRequest` / `ReviewSubmissionRequest`. */
export const SUBMISSION_LIMITS = {
  maxImages: 10,
  maxFiles: 10,
  maxNoteLength: 5000,
  maxReviewCommentLength: 2000,
} as const;
