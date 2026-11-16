import { useRouter } from "expo-router";


import { getMeetingCheckInCodePath, getMeetingScanPath } from "@/features/auth/utils/navigation";
import { useAttendance, useMarkAttendance } from "@/features/meetings/hooks/useAttendance";
import type { AttendanceEntry, AttendanceStatus } from "@/features/meetings/types/meeting.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/stores/toastStore";

/** Attendance on the meeting detail: counts, my status, check-in / QR actions and the organizer checklist. */
export function useMeetingAttendance(bookingId: string) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const { data: currentUser } = useCurrentUser();
  const query = useAttendance(bookingId);
  const markMutation = useMarkAttendance(bookingId);
  const attendance = query.data;

  const myEntry = attendance?.attendees.find((entry) => entry.user.id === currentUser?.id);
  const isCheckedIn = myEntry?.status === "PRESENT" || myEntry?.status === "LATE";
  // The organizer shows the code rather than scanning it.
  const canCheckIn = Boolean(attendance?.checkInOpen && myEntry && !myEntry.organizer && !isCheckedIn);
  const canShowCode = Boolean(attendance?.checkInOpen && attendance.canMark);

  /** Tapping the active status again clears it. */
  const setStatus = (entry: AttendanceEntry, status: AttendanceStatus) => {
    const next: AttendanceStatus = entry.status === status ? "UNKNOWN" : status;
    markMutation.mutate(
      { userId: entry.user.id, status: next },
      { onError: (error) => toast.error("Couldn't update attendance", getApiErrorMessage(error)) },
    );
  };

  return {
    attendance,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    myEntry,
    canCheckIn,
    canShowCode,
    pendingUserId: markMutation.isPending ? markMutation.variables?.userId : undefined,
    setStatus,
    openScanner: () => role && router.push(getMeetingScanPath(role)),
    openCode: () => role && router.push(getMeetingCheckInCodePath(role, bookingId)),
  };
}
