import type { Tone } from "@/styles";

import type { BookingResponse } from "@/features/meetings/types/meeting.types";

/** Badge label and tone for a meeting: cancelled wins, otherwise its time status. */
export function getMeetingStatus(meeting: BookingResponse): { label: string; tone: Tone } {
  if (meeting.status === "CANCELLED") return { label: "Cancelled", tone: "error" };
  switch (meeting.timeStatus) {
    case "IN_PROGRESS":
      return { label: "Happening now", tone: "success" };
    case "COMPLETED":
      return { label: "Finished", tone: "neutral" };
    default:
      return { label: "Upcoming", tone: "info" };
  }
}
