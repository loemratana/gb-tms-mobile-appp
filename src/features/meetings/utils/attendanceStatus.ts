import type { AttendanceStatus } from "@/features/meetings/types/meeting.types";
import type { Tone } from "@/styles";

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  PRESENT: { label: "Present", tone: "success" },
  LATE: { label: "Late", tone: "warning" },
  ABSENT: { label: "Absent", tone: "error" },
  EXCUSED: { label: "Excused", tone: "violet" },
  UNKNOWN: { label: "Not checked in", tone: "faint" },
};

/** Choices on the organizer's checklist, in order. */
export const MARKABLE_STATUSES: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];
