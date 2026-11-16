import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { toDateKey, parseDateKey } from "@/features/calendar/utils/calendarDates";
import {
  canAccessManagerArea,
  getMeetingDetailPathForRole,
  getMeetingFormPathForRole,
  getRoomManagementPath,
} from "@/features/auth/utils/navigation";
import { canBookRooms, canManageRooms } from "@/features/auth/utils/permissions";
import type { MeetingsView } from "@/features/meetings/components/schedule/MeetingsHeader";
import { useMeetingSchedule } from "@/features/meetings/hooks/useMeetingSchedule";
import type { RoomCardSchedule } from "@/features/meetings/components/rooms/RoomCard";
import { useRooms, useRoomsDaySchedule } from "@/features/meetings/hooks/useMeetings";
import type { BookingResponse, RoomResponse } from "@/features/meetings/types/meeting.types";
import { isPastDay } from "@/features/meetings/utils/meetingTime";
import { useTaskSchedulePicker } from "@/features/tasks/hooks/useTaskSchedulePicker";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";

/** Everything the Meetings tab needs: schedule, rooms, the date picker and navigation. */
export function useMeetingsScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const { data: currentUser } = useCurrentUser();
  const canBook = canBookRooms(currentUser);
  // Room admin screens live in the manager area, which admins use.
  const canManage = canManageRooms(currentUser) && Boolean(role && canAccessManagerArea(role));

  const [view, setView] = useState<MeetingsView>("schedule");
  const schedule = useMeetingSchedule();
  const rooms = useRooms();
  // The Rooms view shows each room's bookings on the day picked in the week strip.
  const roomSchedule = useRoomsDaySchedule(schedule.dateKey);
  const roomSchedules = new Map<string, RoomCardSchedule>();
  const now = schedule.isToday ? new Date() : null;
  const calendar = roomSchedule.data;
  for (const row of calendar?.rooms ?? []) {
    const day = row.days[0];
    if (!calendar || !day) continue;
    roomSchedules.set(row.room.id, { day, workdayStart: calendar.workdayStart, workdayEnd: calendar.workdayEnd, now });
  }

  const handlePickDate = useCallback(
    (_target: string, value: string) => schedule.selectDate(parseDateKey(value)),
    [schedule],
  );
  const { openPicker, overlayProps } = useTaskSchedulePicker(
    { startDate: schedule.dateKey },
    handlePickDate,
  );

  const openMeeting = (meeting: BookingResponse) => {
    if (!role) return;
    router.push(getMeetingDetailPathForRole(role, meeting.id));
  };

  /** New meeting on the selected day (today when a past day is selected). */
  const createMeeting = () => {
    if (!role) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const date = isPastDay(schedule.selectedDate) ? toDateKey(new Date()) : schedule.dateKey;
    router.push(getMeetingFormPathForRole(role, { date }));
  };

  const bookRoom = (room: RoomResponse) => {
    if (!role) return;
    const date = isPastDay(schedule.selectedDate) ? toDateKey(new Date()) : schedule.dateKey;
    router.push(getMeetingFormPathForRole(role, { roomId: room.id, date }));
  };

  return {
    view,
    setView,
    schedule,
    rooms,
    roomSchedules,
    isRefreshingRooms: (rooms.isRefetching && !rooms.isLoading) || (roomSchedule.isRefetching && !roomSchedule.isLoading),
    refetchRooms: () => {
      void rooms.refetch();
      void roomSchedule.refetch();
    },
    canBook,
    openDatePicker: () => openPicker("startDate"),
    datePickerOverlay: overlayProps,
    openMeeting,
    createMeeting,
    bookRoom: canBook ? bookRoom : undefined,
    manageRooms: canManage ? () => router.push(getRoomManagementPath()) : undefined,
  };
}
