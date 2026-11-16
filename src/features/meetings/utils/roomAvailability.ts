import type { RoomDaySchedule, RoomStatus } from "@/features/meetings/types/meeting.types";
import { minutesOf, timeOf } from "@/features/meetings/utils/meetingTime";

const DAY_MINUTES = 24 * 60;

export type AvailabilityTone = "free" | "busy" | "closed";

export type RoomDayAvailability = {
  tone: AvailabilityTone;
  /** "Free all day", "In use until 10:00", "3 meetings · next free 11:00". */
  label: string;
  /** Booked parts of the bar, in percent of startLabel-endLabel. */
  segments: { key: string; left: number; width: number }[];
  startLabel: string;
  endLabel: string;
};

/** "23:59" from the server means the meeting runs past midnight. */
function toMinutes(time: string): number {
  const total = minutesOf(time);
  return total >= DAY_MINUTES - 1 ? DAY_MINUTES : total;
}

/**
 * What one room looks like on one day: a short status line and the booked parts of a
 * workday bar (widened to whole hours when a meeting falls outside the workday).
 */
export function describeRoomDay(
  day: RoomDaySchedule,
  status: RoomStatus,
  workdayStart: string,
  workdayEnd: string,
  now: Date | null,
): RoomDayAvailability {
  let start = toMinutes(workdayStart);
  let end = toMinutes(workdayEnd);
  for (const slot of day.busy) {
    start = Math.min(start, toMinutes(slot.startTime));
    end = Math.max(end, toMinutes(slot.endTime));
  }
  start = Math.floor(start / 60) * 60;
  end = Math.min(Math.ceil(end / 60) * 60, DAY_MINUTES);
  const span = end - start;

  const segments = day.busy.map((slot) => {
    const from = Math.max(toMinutes(slot.startTime), start);
    const to = Math.min(toMinutes(slot.endTime), end);
    return {
      key: slot.bookingId,
      left: ((from - start) / span) * 100,
      width: ((to - from) / span) * 100,
    };
  });

  return {
    ...describeStatus(day, status, now),
    segments,
    startLabel: timeOf(start),
    endLabel: end === DAY_MINUTES ? "24:00" : timeOf(end),
  };
}

function describeStatus(
  day: RoomDaySchedule,
  status: RoomStatus,
  now: Date | null,
): { tone: AvailabilityTone; label: string } {
  if (status !== "ACTIVE") {
    return {
      tone: "closed",
      label: status === "MAINTENANCE" ? "Under maintenance" : "Not bookable",
    };
  }
  if (day.busy.length === 0) return { tone: "free", label: "Free all day" };

  const count = `${day.busy.length} meeting${day.busy.length === 1 ? "" : "s"}`;
  if (!now) return { tone: "free", label: count };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const current = day.busy.find(
    (slot) => toMinutes(slot.startTime) <= nowMinutes && nowMinutes < toMinutes(slot.endTime),
  );
  if (current) {
    return {
      tone: "busy",
      label: `In use until ${current.endTime.slice(0, 5)}`,
    };
  }
  return { tone: "free", label: `${count} · free now` };
}
