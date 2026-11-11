import { api, type ApiEnvelope } from "@/lib/api";
import type { PageResponse } from "@/features/tasks/types/task.types";
import type {
  AttendanceResponse,
  AttendanceStatus,
  BookingListParams,
  BookingPreviewRequest,
  BookingPreviewResponse,
  BookingRequest,
  BookingResponse,
  CheckInCodeResponse,
  CheckInResult,
} from "@/features/meetings/types/meeting.types";

/** Meetings the current user organizes or attends. */
export async function listMyBookings(params: BookingListParams = {}): Promise<PageResponse<BookingResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<BookingResponse>>>("/bookings/me", { params });
  return data.data;
}

export async function getBooking(id: string): Promise<BookingResponse> {
  const { data } = await api.get<ApiEnvelope<BookingResponse>>(`/bookings/${id}`);
  return data.data;
}

export async function createBooking(input: BookingRequest): Promise<BookingResponse> {
  const { data } = await api.post<ApiEnvelope<BookingResponse>>("/bookings", input);
  return data.data;
}

export async function updateBooking(id: string, input: BookingRequest): Promise<BookingResponse> {
  const { data } = await api.put<ApiEnvelope<BookingResponse>>(`/bookings/${id}`, input);
  return data.data;
}

export async function cancelBooking(id: string, reason?: string): Promise<BookingResponse> {
  const { data } = await api.post<ApiEnvelope<BookingResponse>>(`/bookings/${id}/cancel`, {
    reason: reason?.trim() || undefined,
  });
  return data.data;
}

/** Attendee count, capacity fit, availability and scope problems — nothing is saved. */
export async function previewBooking(input: BookingPreviewRequest): Promise<BookingPreviewResponse> {
  const { data } = await api.post<ApiEnvelope<BookingPreviewResponse>>("/bookings/preview", input);
  return data.data;
}

// ---- Attendance ----

/** Send exactly what the QR scanner read. */
export async function checkInToMeeting(code: string): Promise<CheckInResult> {
  const { data } = await api.post<ApiEnvelope<CheckInResult>>("/bookings/check-in", { code });
  return data.data;
}

/** Rotating code for the organizer to show; refetch every `refreshSeconds`. */
export async function getCheckInCode(bookingId: string): Promise<CheckInCodeResponse> {
  const { data } = await api.get<ApiEnvelope<CheckInCodeResponse>>(`/bookings/${bookingId}/check-in-code`);
  return data.data;
}

export async function getAttendance(bookingId: string): Promise<AttendanceResponse> {
  const { data } = await api.get<ApiEnvelope<AttendanceResponse>>(`/bookings/${bookingId}/attendance`);
  return data.data;
}

/** Organizer checklist; UNKNOWN clears the mark. */
export async function markAttendance(
  bookingId: string,
  userId: string,
  status: AttendanceStatus,
  note?: string,
): Promise<AttendanceResponse> {
  const { data } = await api.put<ApiEnvelope<AttendanceResponse>>(`/bookings/${bookingId}/attendance/${userId}`, {
    status,
    note: note?.trim() || undefined,
  });
  return data.data;
}
