import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { RoomResponse } from "@/features/meetings/types/meeting.types";
import { ROOM_STATUS_META } from "@/features/meetings/utils/roomStatus";
import { getRemoteImageUrl } from "@/lib/remoteImage";
import { colors } from "@/styles";

type RoomAdminRowProps = {
  room: RoomResponse;
  onPress: (room: RoomResponse) => void;
};

/** One room in the admin list: cover, name, code, capacity, photo count and status. */
export function RoomAdminRow({ room, onPress }: RoomAdminRowProps) {
  const status = ROOM_STATUS_META[room.status];

  return (
    <Pressable
      onPress={() => onPress(room)}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${status.label}, ${room.capacity} seats`}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3 active:bg-field"
    >
      {room.coverImageUrl ? (
        <Image
          source={{ uri: getRemoteImageUrl(room.coverImageUrl) }}
          style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.mutedBg }}
          contentFit="cover"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-subtle">
          <Ionicons name="business-outline" size={22} color={colors.textSubtle} />
        </View>
      )}
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="min-w-0 shrink text-body-sm font-semibold text-fg" numberOfLines={1}>
            {room.name}
          </Text>
          {room.code ? <Text className="text-label text-fg-faint">{room.code}</Text> : null}
        </View>
        <Text className="text-label text-fg-soft" numberOfLines={1}>
          {room.capacity} seats · {room.images.length} {room.images.length === 1 ? "photo" : "photos"}
          {room.location ? ` · ${room.location}` : ""}
        </Text>
        <Badge label={status.label} tone={status.tone} hasDot />
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </Pressable>
  );
}
