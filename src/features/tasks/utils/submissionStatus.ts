import type { SubmissionStatus } from "@/features/tasks/types/submission.types";
import { palette } from "@/styles";

/** Badge label and colors for a submission's review status. */
export const SUBMISSION_STATUS_STYLE: Record<
  SubmissionStatus,
  { label: string; bg: string; color: string }
> = {
  PENDING: { label: "Awaiting review", bg: palette.amber[50], color: palette.amber[600] },
  APPROVED: { label: "Approved", bg: palette.green[50], color: palette.green[600] },
  REJECTED: { label: "Rejected", bg: palette.red[50], color: palette.red[600] },
};

export function formatSubmissionDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
