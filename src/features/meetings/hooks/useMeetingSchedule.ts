import { useEffect, useMemo, useState } from "react";

import { toDateKey } from "@/features/calendar/utils/calendarDates";
import { useMyMeetingsForDay } from "@/features/meetings/hooks/useMeetings";
import {
  getNowOffset,
  getTimelineBounds,
  getWeekDays,
  layoutTimeline,
  type TimelineBounds,
  type TimelineItem,
} from "@/features/meetings/utils/meetingTime";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

const NOW_TICK_MS = 60_000;

export type MeetingSchedule = {
  selectedDate: Date;
  dateKey: string;
  isToday: boolean;
  weekDays: Date[];
  bounds: TimelineBounds;
  items: TimelineItem[];
  /** Y offset of the "now" line; null on other days or outside the visible hours. */
  nowOffset: number | null;
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  refetch: () => void;
  selectDate: (date: Date) => void;
  goToday: () => void;
};

/** Day selection, the selected day's meetings laid out on a timeline, and the live "now" line. */
export function useMeetingSchedule(): MeetingSchedule {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), NOW_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const dateKey = toDateKey(selectedDate);
  const isToday = dateKey === toDateKey(now);
  const query = useMyMeetingsForDay(dateKey);
  useRefetchOnFocus(query.refetch);

  const meetings = useMemo(() => query.data ?? [], [query.data]);
  const bounds = useMemo(() => getTimelineBounds(meetings), [meetings]);
  const items = useMemo(() => layoutTimeline(meetings, bounds), [meetings, bounds]);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  return {
    selectedDate,
    dateKey,
    isToday,
    weekDays,
    bounds,
    items,
    nowOffset: isToday ? getNowOffset(now, bounds) : null,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefreshing: query.isRefetching && !query.isLoading,
    refetch: () => void query.refetch(),
    selectDate: setSelectedDate,
    goToday: () => setSelectedDate(new Date()),
  };
}
