import { endOfMonth, startOfMonth, toDateKey } from "@/features/calendar/utils/calendarDates";
import { useMyMeetingsInRange } from "@/features/meetings/hooks/useMeetings";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

type CalendarMeetings = {
  meetings: BookingResponse[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

/** The current user's confirmed meetings in the month containing `monthDate`. */
export function useCalendarMeetings(monthDate: Date): CalendarMeetings {
  const query = useMyMeetingsInRange(toDateKey(startOfMonth(monthDate)), toDateKey(endOfMonth(monthDate)));
  useRefetchOnFocus(query.refetch);

  return {
    meetings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
