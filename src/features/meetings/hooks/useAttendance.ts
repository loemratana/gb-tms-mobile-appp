import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { meetingKeys } from "@/features/meetings/hooks/useMeetings";
import type { AttendanceStatus } from "@/features/meetings/types/meeting.types";
import { checkInToMeeting, getAttendance, getCheckInCode, markAttendance } from "@/services/bookings.service";

/** While the organizer has the QR screen open, refresh the counts this often. */
const LIVE_ATTENDANCE_MS = 10_000;

export const attendanceKeys = {
  attendance: (bookingId: string) => [...meetingKeys.all, "attendance", bookingId] as const,
  code: (bookingId: string) => [...meetingKeys.all, "check-in-code", bookingId] as const,
};

export function useAttendance(bookingId: string | undefined, isLive = false) {
  return useQuery({
    queryKey: attendanceKeys.attendance(bookingId ?? ""),
    queryFn: () => getAttendance(bookingId as string),
    enabled: Boolean(bookingId),
    refetchInterval: isLive ? LIVE_ATTENDANCE_MS : false,
  });
}

/** The rotating QR code; refetched just before each one expires. */
export function useCheckInCode(bookingId: string | undefined) {
  return useQuery({
    queryKey: attendanceKeys.code(bookingId ?? ""),
    queryFn: () => getCheckInCode(bookingId as string),
    enabled: Boolean(bookingId),
    refetchInterval: (query) => Math.max(((query.state.data?.refreshSeconds ?? 30) - 3) * 1000, 5_000),
    refetchIntervalInBackground: false,
    retry: false,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => checkInToMeeting(code),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.attendance(result.bookingId) });
    },
  });
}

export function useMarkAttendance(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status, note }: { userId: string; status: AttendanceStatus; note?: string }) =>
      markAttendance(bookingId, userId, status, note),
    onSuccess: (attendance) => {
      queryClient.setQueryData(attendanceKeys.attendance(bookingId), attendance);
    },
  });
}
