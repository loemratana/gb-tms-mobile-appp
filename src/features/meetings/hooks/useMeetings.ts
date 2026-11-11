import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelBooking,
  createBooking,
  getBooking,
  listMyBookings,
  previewBooking,
  updateBooking,
} from "@/services/bookings.service";
import { getAvailableRooms, getRoom, searchRooms } from "@/services/rooms.service";
import type {
  AvailableRoomsParams,
  BookingPreviewRequest,
  BookingRequest,
  RoomSearchParams,
} from "@/features/meetings/types/meeting.types";

/** A day rarely has more meetings than this for one person. */
const DAY_PAGE_SIZE = 100;

export const meetingKeys = {
  all: ["meetings"] as const,
  days: () => [...meetingKeys.all, "day"] as const,
  day: (dateKey: string) => [...meetingKeys.days(), dateKey] as const,
  detail: (id: string) => [...meetingKeys.all, "detail", id] as const,
  preview: (request: BookingPreviewRequest) => [...meetingKeys.all, "preview", request] as const,
};

export const roomKeys = {
  all: ["rooms"] as const,
  list: (params: RoomSearchParams) => [...roomKeys.all, "list", params] as const,
  available: (params: AvailableRoomsParams) => [...roomKeys.all, "available", params] as const,
  detail: (id: string) => [...roomKeys.all, "detail", id] as const,
};

/** Confirmed meetings the current user organizes or attends on one day ("YYYY-MM-DD"). */
export function useMyMeetingsForDay(dateKey: string) {
  return useQuery({
    queryKey: meetingKeys.day(dateKey),
    queryFn: async () => {
      const page = await listMyBookings({
        from: dateKey,
        to: dateKey,
        status: "CONFIRMED",
        size: DAY_PAGE_SIZE,
        sort: "startAt",
      });
      return page.content;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: meetingKeys.detail(id ?? ""),
    queryFn: () => getBooking(id as string),
    enabled: Boolean(id),
  });
}

export function useRooms(params: RoomSearchParams = { status: "ACTIVE", size: 100 }) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => (await searchRooms(params)).content,
    staleTime: 5 * 60_000,
  });
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: roomKeys.detail(id ?? ""),
    queryFn: () => getRoom(id as string),
    enabled: Boolean(id),
  });
}

export function useAvailableRooms(params: AvailableRoomsParams | null) {
  return useQuery({
    queryKey: roomKeys.available(params ?? { date: "", startTime: "", endTime: "" }),
    queryFn: () => getAvailableRooms(params as AvailableRoomsParams),
    enabled: params !== null,
  });
}

/** Server-side check of a draft booking; `request` null disables it. */
export function useBookingPreview(request: BookingPreviewRequest | null) {
  return useQuery({
    queryKey: meetingKeys.preview(request ?? { targets: { departmentIds: [], positionIds: [], userIds: [] } }),
    queryFn: () => previewBooking(request as BookingPreviewRequest),
    enabled: request !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

function useInvalidateMeetings() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    // Room availability changes with every booking.
    void queryClient.invalidateQueries({ queryKey: [...roomKeys.all, "available"] });
  };
}

export function useCreateBooking() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: (input: BookingRequest) => createBooking(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBooking() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BookingRequest }) => updateBooking(id, input),
    onSuccess: invalidate,
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: invalidate,
  });
}
