import { Text, View } from "react-native";

import type { RoomDaySchedule, RoomStatus } from "@/features/meetings/types/meeting.types";
import { formatTimeRange } from "@/features/meetings/utils/meetingTime";
import { describeRoomDay } from "@/features/meetings/utils/roomAvailability";
import { colors } from "@/styles";

const MAX_LISTED = 3;

const TONE_COLOR = {
  free: colors.success,
  busy: colors.danger,
  closed: colors.textSubtle,
} as const;

type RoomDayTimelineProps = {
  day: RoomDaySchedule;
  status: RoomStatus;
  workdayStart: string;
  workdayEnd: string;
  /** Set only when `day` is today, for "In use until …". */
  now: Date | null;
};

/** A room's day: status line, a bar with the booked parts filled, and the first few meetings. */
export function RoomDayTimeline({ day, status, workdayStart, workdayEnd, now }: RoomDayTimelineProps) {
  const availability = describeRoomDay(day, status, workdayStart, workdayEnd, now);
  const listed = day.busy.slice(0, MAX_LISTED);
  const hidden = day.busy.length - listed.length;

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1.5">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: TONE_COLOR[availability.tone],
          }}
        />
        <Text className="text-caption font-semibold text-fg-sub">{availability.label}</Text>
      </View>

      <View
        accessible
        accessibilityLabel={
          day.busy.length === 0
            ? "No meetings booked"
            : `Booked ${day.busy.map((slot) => `${slot.startTime} to ${slot.endTime}`).join(", ")}`
        }
      >
        <View className="h-2 overflow-hidden rounded-full bg-subtle">
          {availability.segments.map((segment) => (
            <View
              key={segment.key}
              className="absolute bottom-0 top-0 bg-brand"
              style={{
                left: `${segment.left}%`,
                width: `${Math.max(segment.width, 1)}%`,
              }}
            />
          ))}
        </View>
        <View className="mt-0.5 flex-row justify-between">
          <Text className="text-micro text-fg-soft">{availability.startLabel}</Text>
          <Text className="text-micro text-fg-soft">{availability.endLabel}</Text>
        </View>
      </View>

      {listed.map((slot) => (
        <Text key={slot.bookingId} className="text-micro text-fg-soft" numberOfLines={1}>
          <Text className="font-semibold text-fg-sub">{formatTimeRange(slot.startTime, slot.endTime)}</Text>
          {"  "}
          {slot.title} · {slot.organizerName}
        </Text>
      ))}
      {hidden > 0 ? <Text className="text-micro text-fg-soft">+{hidden} more</Text> : null}
    </View>
  );
}
