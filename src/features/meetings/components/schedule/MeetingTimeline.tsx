import { useState } from "react";
import { Text, View } from "react-native";

import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import {
  HOUR_HEIGHT,
  timeOf,
  type TimelineBounds,
  type TimelineItem,
} from "@/features/meetings/utils/meetingTime";
import { MeetingCard } from "./MeetingCard";

const HOUR_LABEL_WIDTH = 52;
const LANE_GAP = 6;
/** Cards shorter than this show the compact layout. */
const COMPACT_HEIGHT = 64;

type MeetingTimelineProps = {
  bounds: TimelineBounds;
  items: TimelineItem[];
  nowOffset: number | null;
  onPressMeeting: (meeting: BookingResponse) => void;
};

/** Hour grid with meeting cards placed by time; overlapping meetings sit side by side. */
export function MeetingTimeline({ bounds, items, nowOffset, onPressMeeting }: MeetingTimelineProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const hours = Array.from({ length: bounds.endHour - bounds.startHour + 1 }, (_, index) => bounds.startHour + index);
  const height = (bounds.endHour - bounds.startHour) * HOUR_HEIGHT;

  return (
    <View style={{ height: height + 16 }} className="pt-2">
      {hours.map((hour, index) => (
        <View
          key={hour}
          className="absolute left-0 right-0 flex-row items-center"
          style={{ top: index * HOUR_HEIGHT }}
        >
          <Text className="text-label text-fg-faint" style={{ width: HOUR_LABEL_WIDTH }}>
            {timeOf(hour * 60)}
          </Text>
          <View className="h-px flex-1 border-t border-dashed border-line" />
        </View>
      ))}

      <View
        className="absolute bottom-0 right-0 top-2"
        style={{ left: HOUR_LABEL_WIDTH }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        {trackWidth > 0
          ? items.map((item, index) => {
              const laneWidth = (trackWidth - LANE_GAP * (item.laneCount - 1)) / item.laneCount;
              return (
                <View
                  key={item.meeting.id}
                  className="absolute"
                  style={{
                    top: item.top + 2,
                    height: item.height - 4,
                    left: item.lane * (laneWidth + LANE_GAP),
                    width: laneWidth,
                  }}
                >
                  <MeetingCard
                    meeting={item.meeting}
                    index={index}
                    isCompact={item.height < COMPACT_HEIGHT || item.laneCount > 2}
                    onPress={onPressMeeting}
                  />
                </View>
              );
            })
          : null}
      </View>

      {nowOffset !== null ? (
        <View
          pointerEvents="none"
          className="absolute right-0 flex-row items-center"
          style={{ top: nowOffset + 8 - 4, left: HOUR_LABEL_WIDTH - 4 }}
          accessibilityLabel="Current time"
        >
          <View className="h-2 w-2 rounded-full bg-brand" />
          <View className="h-0.5 flex-1 bg-brand" />
        </View>
      ) : null}
    </View>
  );
}
