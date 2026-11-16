import { addDays, toDateKey } from "@/features/calendar/utils/calendarDates";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";

/** Working hours shown on the day timeline; widened when a meeting falls outside them. */
export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = 18;
/** Vertical pixels per hour on the day timeline. */
export const HOUR_HEIGHT = 88;
/** The backend only accepts times on 15-minute steps. */
export const SLOT_MINUTES = 15;

/** "15:30" → 930. */
export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** 930 → "15:30". */
export function timeOf(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
}

/** Rounds "15:07" to the nearest 15-minute step ("15:00"). */
export function snapToSlot(time: string): string {
  const snapped = Math.round(minutesOf(time) / SLOT_MINUTES) * SLOT_MINUTES;
  return timeOf(Math.min(snapped, 23 * 60 + 45));
}

/** "15:00" + 60 → "16:00", capped at 23:45. */
export function addMinutesToTime(time: string, amount: number): string {
  return timeOf(Math.min(minutesOf(time) + amount, 23 * 60 + 45));
}

/** "15:00 – 16:00". */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
}

/** "Nov 11, Wednesday". */
export function formatDayHeading(date: Date): string {
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${monthDay}, ${weekday}`;
}

/** "Wed, Nov 11, 2026" from a "2026-11-11" key. */
export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Monday-to-Sunday week containing `date`, the same week start as the Calendar tab's month grid. */
export function getWeekDays(date: Date): Date[] {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = addDays(date, -daysSinceMonday);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function isPastDay(date: Date): boolean {
  return toDateKey(date) < toDateKey(new Date());
}

export type TimelineBounds = { startHour: number; endHour: number };

/** Working hours, widened to fit any meeting that starts earlier or ends later. */
export function getTimelineBounds(meetings: BookingResponse[]): TimelineBounds {
  let startHour = TIMELINE_START_HOUR;
  let endHour = TIMELINE_END_HOUR;
  for (const meeting of meetings) {
    startHour = Math.min(startHour, Math.floor(minutesOf(meeting.startTime) / 60));
    endHour = Math.max(endHour, Math.ceil(minutesOf(meeting.endTime) / 60));
  }
  return { startHour, endHour };
}

export type TimelineItem = {
  meeting: BookingResponse;
  top: number;
  height: number;
  /** Side-by-side position when meetings overlap: lane index and how many lanes the group uses. */
  lane: number;
  laneCount: number;
};

/** Positions meetings on the timeline; overlapping meetings share the width in lanes. */
export function layoutTimeline(meetings: BookingResponse[], bounds: TimelineBounds): TimelineItem[] {
  const sorted = [...meetings].sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime));
  const items: TimelineItem[] = [];
  let group: TimelineItem[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;

  const closeGroup = () => {
    group.forEach((item) => {
      item.laneCount = laneEnds.length;
    });
    items.push(...group);
    group = [];
    laneEnds = [];
  };

  for (const meeting of sorted) {
    const start = minutesOf(meeting.startTime);
    const end = minutesOf(meeting.endTime);
    if (start >= groupEnd) {
      closeGroup();
    }
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    groupEnd = Math.max(groupEnd, end);
    group.push({
      meeting,
      top: ((start - bounds.startHour * 60) / 60) * HOUR_HEIGHT,
      height: Math.max(((end - start) / 60) * HOUR_HEIGHT, 44),
      lane,
      laneCount: 1,
    });
  }
  closeGroup();
  return items;
}

/** Y offset of the current-time line, or null when now is outside the visible hours. */
export function getNowOffset(now: Date, bounds: TimelineBounds): number | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < bounds.startHour * 60 || minutes > bounds.endHour * 60) {
    return null;
  }
  return ((minutes - bounds.startHour * 60) / 60) * HOUR_HEIGHT;
}
