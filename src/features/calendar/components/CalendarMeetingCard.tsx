import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import { getMeetingPlace } from "@/features/meetings/utils/meetingLocation";
import { colors } from "@/styles";

type CalendarMeetingCardProps = {
  meeting: BookingResponse;
  onPress?: (meeting: BookingResponse) => void;
};

/**
 * A meeting in the calendar lists. Shaped differently from a task card on purpose — time column
 * on the left, brand edge, place underneath — so meetings and due tasks never read as the same thing.
 */
export function CalendarMeetingCard({ meeting, onPress }: CalendarMeetingCardProps) {
  const place = getMeetingPlace(meeting);
  const isNow = meeting.timeStatus === "IN_PROGRESS";
  const isDone = meeting.timeStatus === "COMPLETED";
  const startTime = meeting.startTime.slice(0, 5);
  const endTime = meeting.endTime.slice(0, 5);

  return (
    <Pressable
      onPress={() => onPress?.(meeting)}
      accessibilityRole="button"
      accessibilityLabel={`Meeting: ${meeting.title}, ${startTime} to ${endTime}, ${place.label}${isNow ? ", happening now" : ""}`}
      className="flex-row overflow-hidden rounded-xl border border-line bg-surface active:bg-field"
      style={{ opacity: isDone ? 0.6 : 1 }}
    >
      <View className="w-1 bg-brand" />
      <View className="w-16 items-center justify-center border-r border-line-soft py-3">
        <Text className="text-body-sm font-semibold text-fg">{startTime}</Text>
        <Text className="text-label text-fg-faint">{endTime}</Text>
      </View>
      <View className="min-w-0 flex-1 justify-center gap-1 px-3 py-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="people" size={14} color={colors.brand} />
          <Text className="min-w-0 flex-1 text-body-sm font-semibold text-fg" numberOfLines={1}>
            {meeting.title}
          </Text>
          {isNow ? (
            <View className="rounded-md bg-brand-subtle px-1.5 py-0.5">
              <Text className="text-micro font-bold text-brand-strong">NOW</Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name={place.icon} size={13} color={colors.textSubtle} />
          <Text className="min-w-0 flex-1 text-label text-fg-soft" numberOfLines={1}>
            {place.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
