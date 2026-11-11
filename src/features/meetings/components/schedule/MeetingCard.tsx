import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import { getMeetingPlace } from "@/features/meetings/utils/meetingLocation";
import { formatTimeRange } from "@/features/meetings/utils/meetingTime";
import { colors, toneColors, type Tone } from "@/styles";

/** Left accent colours, cycled so neighbouring meetings are easy to tell apart. */
const ACCENT_TONES: Tone[] = ["info", "warning", "violet", "success"];

type MeetingCardProps = {
  meeting: BookingResponse;
  /** Position in the day, picks the accent colour. */
  index: number;
  /** Short cards (≤ 30 min) show only the title and time. */
  isCompact?: boolean;
  onPress: (meeting: BookingResponse) => void;
};

export function MeetingCard({ meeting, index, isCompact = false, onPress }: MeetingCardProps) {
  const tone = toneColors[ACCENT_TONES[index % ACCENT_TONES.length]];
  const isNow = meeting.timeStatus === "IN_PROGRESS";
  const isDone = meeting.timeStatus === "COMPLETED";
  const others = meeting.attendeeCount - 1;
  const place = getMeetingPlace(meeting);

  return (
    <Pressable
      onPress={() => onPress(meeting)}
      accessibilityRole="button"
      accessibilityLabel={`${meeting.title}, ${place.label}, ${formatTimeRange(meeting.startTime, meeting.endTime)}`}
      className="h-full flex-row overflow-hidden rounded-2xl border border-line bg-surface active:bg-field"
      style={{ opacity: isDone ? 0.6 : 1 }}
    >
      <View className="w-1" style={{ backgroundColor: tone.color }} />
      <View className="min-w-0 flex-1 px-3 py-2">
        <View className="flex-row items-start gap-2">
          <Text className="min-w-0 flex-1 text-body-sm font-semibold text-fg" numberOfLines={1}>
            {meeting.title}
          </Text>
          {isNow ? (
            <View className="rounded-md bg-brand-subtle px-1.5 py-0.5">
              <Text className="text-micro font-bold text-brand-strong">NOW</Text>
            </View>
          ) : null}
        </View>

        {isCompact ? (
          <Text className="text-label text-fg-soft" numberOfLines={1}>
            {formatTimeRange(meeting.startTime, meeting.endTime)} · {place.label}
          </Text>
        ) : (
          <View className="mt-1 flex-row items-end justify-between gap-2">
            <View className="min-w-0 flex-1 gap-0.5">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name={place.icon} size={12} color={colors.textSubtle} />
                <Text className="min-w-0 flex-1 text-label text-fg-soft" numberOfLines={1}>
                  {place.label}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={12} color={colors.textSubtle} />
                <Text className="text-label text-fg-soft">{formatTimeRange(meeting.startTime, meeting.endTime)}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Avatar name={meeting.organizer.fullName} imageUrl={meeting.organizer.avatarUrl} size={28} />
              {others > 0 ? (
                <View
                  className="-ml-2 h-7 min-w-7 items-center justify-center rounded-full border-2 border-surface px-1"
                  style={{ backgroundColor: tone.subtle }}
                >
                  <Text className="text-micro font-semibold" style={{ color: tone.fg }}>
                    +{others}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
