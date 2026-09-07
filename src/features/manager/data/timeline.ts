import { teamMembers } from "@/features/employee/data/team";

export type TimelineFilter = "all" | "tasks" | "meetings" | "reviews";

export type TimelinePeriod = "morning" | "afternoon" | "evening";

export type TimelineEventStatus =
  | "in_progress"
  | "done"
  | "review"
  | "overdue"
  | "meeting"
  | "todo";

export type TimelineEventType = "task" | "meeting" | "review";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  period: TimelinePeriod;
  employeeName: string;
  employeeAvatar: string;
  status: TimelineEventStatus;
  priority: "low" | "medium" | "high" | "urgent";
  note?: string;
};

export type TeamQuickStatus = {
  id: string;
  name: string;
  avatarUrl: string;
  status: "available" | "busy" | "overloaded";
};

export type CalendarViewMode = "schedule" | "day" | "week" | "month";

export type MonthGridCell = {
  date: Date;
  inMonth: boolean;
};

export const STATUS_COLORS: Record<TimelineEventStatus, string> = {
  in_progress: "#2563EB",
  done: "#32CD32",
  review: "#F97316",
  overdue: "#EF4444",
  meeting: "#7C3AED",
  todo: "#6B7280",
};

export const STATUS_LABELS: Record<TimelineEventStatus, string> = {
  in_progress: "In Progress",
  done: "Done",
  review: "Review",
  overdue: "Overdue",
  meeting: "Meeting",
  todo: "To Do",
};

export const PERIOD_LABELS: Record<TimelinePeriod, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const teamQuickStatuses: TeamQuickStatus[] = [
  {
    id: "m1",
    name: "Ratana",
    avatarUrl: teamMembers[0].avatarUrl,
    status: "busy",
  },
  {
    id: "m2",
    name: "Srey Leak",
    avatarUrl: teamMembers[1].avatarUrl,
    status: "available",
  },
  {
    id: "m3",
    name: "Piseth",
    avatarUrl: teamMembers[2].avatarUrl,
    status: "overloaded",
  },
  {
    id: "m4",
    name: "Bopha",
    avatarUrl: teamMembers[3].avatarUrl,
    status: "available",
  },
  {
    id: "m5",
    name: "Dara",
    avatarUrl: teamMembers[5].avatarUrl,
    status: "busy",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "e1",
    type: "task",
    title: "Design Review for Mobile App",
    date: "2026-07-06",
    time: "09:00",
    endTime: "10:30",
    period: "morning",
    employeeName: "Srey Leak",
    employeeAvatar: teamMembers[1].avatarUrl,
    status: "in_progress",
    priority: "high",
    note: "Finalize employee flows",
  },
  {
    id: "e2",
    type: "meeting",
    title: "Sprint Planning Standup",
    date: "2026-07-06",
    time: "10:45",
    endTime: "11:30",
    period: "morning",
    employeeName: "Sokha Chen",
    employeeAvatar: "https://i.pravatar.cc/80?img=12",
    status: "meeting",
    priority: "medium",
  },
  {
    id: "e3",
    type: "review",
    title: "Checkout Bug Fix Review",
    date: "2026-07-06",
    time: "11:45",
    period: "morning",
    employeeName: "Ratana",
    employeeAvatar: teamMembers[0].avatarUrl,
    status: "review",
    priority: "urgent",
    note: "Waiting for manager approval",
  },
  {
    id: "e4",
    type: "task",
    title: "API Integration Testing",
    date: "2026-07-07",
    time: "13:00",
    endTime: "14:30",
    period: "afternoon",
    employeeName: "Piseth",
    employeeAvatar: teamMembers[2].avatarUrl,
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "e5",
    type: "task",
    title: "Q2 Marketing Content",
    date: "2026-07-07",
    time: "14:45",
    period: "afternoon",
    employeeName: "Bopha",
    employeeAvatar: teamMembers[3].avatarUrl,
    status: "overdue",
    priority: "high",
    note: "Delayed by 1 day",
  },
  {
    id: "e6",
    type: "meeting",
    title: "Client Demo Walkthrough",
    date: "2026-07-08",
    time: "16:00",
    endTime: "17:00",
    period: "afternoon",
    employeeName: "Dara",
    employeeAvatar: teamMembers[5].avatarUrl,
    status: "meeting",
    priority: "high",
  },
  {
    id: "e7",
    type: "task",
    title: "Release Notes Draft",
    date: "2026-07-06",
    time: "18:30",
    period: "evening",
    employeeName: "Ratana",
    employeeAvatar: teamMembers[0].avatarUrl,
    status: "todo",
    priority: "low",
  },
  {
    id: "e8",
    type: "review",
    title: "UI Polish Sign-off",
    date: "2026-07-09",
    time: "19:15",
    period: "evening",
    employeeName: "Srey Leak",
    employeeAvatar: teamMembers[1].avatarUrl,
    status: "review",
    priority: "medium",
  },
  {
    id: "e9",
    type: "task",
    title: "Sprint Retrospective Prep",
    date: "2026-07-10",
    time: "09:30",
    period: "morning",
    employeeName: "Bopha",
    employeeAvatar: teamMembers[3].avatarUrl,
    status: "todo",
    priority: "medium",
  },
  {
    id: "e10",
    type: "meeting",
    title: "Stakeholder Sync",
    date: "2026-07-12",
    time: "11:00",
    period: "morning",
    employeeName: "Sokha Chen",
    employeeAvatar: "https://i.pravatar.cc/80?img=12",
    status: "meeting",
    priority: "high",
  },
  {
    id: "e11",
    type: "task",
    title: "Performance Audit",
    date: "2026-07-15",
    time: "14:00",
    period: "afternoon",
    employeeName: "Piseth",
    employeeAvatar: teamMembers[2].avatarUrl,
    status: "in_progress",
    priority: "high",
  },
  {
    id: "e12",
    type: "review",
    title: "Mobile QA Sign-off",
    date: "2026-07-18",
    time: "15:30",
    period: "afternoon",
    employeeName: "Ratana",
    employeeAvatar: teamMembers[0].avatarUrl,
    status: "review",
    priority: "urgent",
  },
];

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDateKey(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

export function formatTimelineHeaderDate(date = new Date()) {
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const rest = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `Today, ${day} ${rest}`;
}

export function formatDayHeader(date: Date) {
  const today = new Date();
  const prefix = isSameDateKey(date, today) ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
  const suffix = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${prefix} · ${suffix}`;
}

export function formatDayShort(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
}

export function getMonthYearLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDisplayTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function formatHourLabel(hour: number) {
  const ampm = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${ampm}`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function filterTimelineEvents(
  events: TimelineEvent[],
  filter: TimelineFilter
) {
  if (filter === "all") return events;
  if (filter === "tasks") return events.filter((e) => e.type === "task");
  if (filter === "meetings") return events.filter((e) => e.type === "meeting");
  return events.filter((e) => e.type === "review");
}

export function getEventsForDate(events: TimelineEvent[], dateKey: string) {
  return events
    .filter((event) => event.date === dateKey)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

export function groupEventsByPeriod(events: TimelineEvent[]) {
  const order: TimelinePeriod[] = ["morning", "afternoon", "evening"];
  return order
    .map((period) => ({
      period,
      events: events.filter((e) => e.period === period),
    }))
    .filter((group) => group.events.length > 0);
}

export function getMonthGrid(monthDate: Date): MonthGridCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

export function getWeekDays(referenceDate: Date) {
  const day = referenceDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

/** e.g. "Aug 24-30" or "Aug 31 - Sep 4" when the range spans two months. */
export function formatDateRangeLabel(days: Date[]) {
  const start = days[0];
  const end = days[days.length - 1];
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = sameMonth
    ? `${end.getDate()}`
    : end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startLabel}-${endLabel}`;
}

export function getIsoWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** e.g. "Week 51, December 18 - 24" — matches the Mon-Sun week containing `referenceDate`. */
export function formatWeekDividerLabel(referenceDate: Date) {
  const days = getWeekDays(referenceDate);
  const weekNumber = getIsoWeekNumber(days[0]);
  const start = days[0];
  const end = days[6];
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const endLabel = sameMonth
    ? `${end.getDate()}`
    : end.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `Week ${weekNumber}, ${startLabel} - ${endLabel}`;
}

export type AgendaEntry =
  | { kind: "day"; date: Date; events: TimelineEvent[] }
  | { kind: "gap"; label: string };

/** Groups events by day, sorted chronologically, with a "Week N, ..." divider inserted wherever a day is skipped — mirrors Google Calendar's Schedule view. */
export function buildAgendaEntries(events: TimelineEvent[]): AgendaEntry[] {
  const byDate = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }

  const sortedKeys = Array.from(byDate.keys()).sort();
  const entries: AgendaEntry[] = [];
  let previousDate: Date | null = null;

  for (const key of sortedKeys) {
    const date = parseDateKey(key);
    if (previousDate && date.getTime() - previousDate.getTime() > 86400000) {
      entries.push({ kind: "gap", label: formatWeekDividerLabel(addDays(previousDate, 1)) });
    }

    entries.push({
      kind: "day",
      date,
      events: (byDate.get(key) ?? []).sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
      ),
    });
    previousDate = date;
  }

  return entries;
}
