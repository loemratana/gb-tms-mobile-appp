import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { RoomDaySchedule, RoomResponse } from "@/features/meetings/types/meeting.types";
import { ROOM_FACILITY_META } from "@/features/meetings/utils/roomFacilities";
import { getRemoteImageUrl } from "@/lib/remoteImage";
import { colors } from "@/styles";
import { RoomDayTimeline } from "./RoomDayTimeline";

const IMAGE_SIZE = 96;

/** The room's bookings on the selected day, from GET /rooms/schedule. */
export type RoomCardSchedule = {
  day: RoomDaySchedule;
  workdayStart: string;
  workdayEnd: string;
  /** Set only when the day is today. */
  now: Date | null;
};

type RoomCardProps = {
  room: RoomResponse;
  /** Hidden for users who can't book (no bookings:create). */
  onBook?: (room: RoomResponse) => void;
  schedule?: RoomCardSchedule;
};

/** Room photo, name, location, capacity and facilities, the day's bookings, and a Book action. */
export function RoomCard({ room, onBook, schedule }: RoomCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-3">
      <View className="flex-row gap-3">
        {room.coverImageUrl ? (
          <Image
            source={{ uri: getRemoteImageUrl(room.coverImageUrl) }}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE + 24,
              borderRadius: 12,
              backgroundColor: colors.mutedBg,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel={`Photo of ${room.name}`}
          />
        ) : (
          <View
            className="items-center justify-center rounded-xl bg-subtle"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE + 24 }}
          >
            <Ionicons name="business-outline" size={28} color={colors.textSubtle} />
          </View>
        )}

        <View className="min-w-0 flex-1 justify-between">
          <View className="gap-1">
            <Text className="text-body font-semibold text-fg" numberOfLines={1}>
              {room.name}
            </Text>
            {room.location ? (
              <View className="flex-row items-start gap-1">
                <Ionicons name="location-outline" size={13} color={colors.textSubtle} style={{ marginTop: 2 }} />
                <Text className="min-w-0 flex-1 text-label text-fg-soft" numberOfLines={2}>
                  {room.location}
                </Text>
              </View>
            ) : null}
            <View className="mt-0.5 flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <View
                className="flex-row items-center gap-1"
                accessible
                accessibilityLabel={`Up to ${room.capacity} people`}
              >
                <Ionicons name="people-outline" size={14} color={colors.brand} />
                <Text className="text-label font-semibold text-fg-sub">{room.capacity}</Text>
              </View>
              {room.facilities.map((facility) => (
                <Ionicons
                  key={facility}
                  name={ROOM_FACILITY_META[facility].icon}
                  size={14}
                  color={colors.brand}
                  accessibilityLabel={ROOM_FACILITY_META[facility].label}
                />
              ))}
            </View>
          </View>

          {onBook ? (
            <View className="mt-2">
              <Button label="Book" variant="outline" size="sm" isFullWidth={false} onPress={() => onBook(room)} />
            </View>
          ) : null}
        </View>
      </View>
      {schedule ? (
        <View className="border-t border-line pt-3">
          <RoomDayTimeline
            day={schedule.day}
            status={room.status}
            workdayStart={schedule.workdayStart}
            workdayEnd={schedule.workdayEnd}
            now={schedule.now}
          />
        </View>
      ) : null}
    </View>
  );
}
