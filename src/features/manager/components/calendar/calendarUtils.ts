import {
  getEventsForDate,
  timelineEvents,
  toDateKey,
  type TimelineEvent,
} from "@/features/manager/data/timeline";

export type CalendarSummary = {
  events: number;
  reviews: number;
  overdue: number;
  meetings: number;
};

export function getCalendarSummary(
  events: TimelineEvent[],
  date: Date
): CalendarSummary {
  const dayEvents = getEventsForDate(events, toDateKey(date));
  return {
    events: dayEvents.length,
    reviews: dayEvents.filter((e) => e.type === "review").length,
    overdue: dayEvents.filter((e) => e.status === "overdue").length,
    meetings: dayEvents.filter((e) => e.type === "meeting").length,
  };
}

export function getMonthEventCount(events: TimelineEvent[], monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  return events.filter((event) => {
    const [y, m] = event.date.split("-").map(Number);
    return y === year && m - 1 === month;
  }).length;
}

/** Re-export for convenience in calendar UI */
export { timelineEvents };
