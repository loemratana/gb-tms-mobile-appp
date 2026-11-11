import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { FlatList, Pressable, Text, View } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { StateView } from "@/components/ui/StateView";
import type { RoomResponse } from "@/features/meetings/types/meeting.types";
import { getRemoteImageUrl } from "@/lib/remoteImage";
import { colors } from "@/styles";

type RoomPickerModalProps = {
  visible: boolean;
  rooms: RoomResponse[];
  isLoading: boolean;
  selectedRoomId: string;
  /** Rooms free for the chosen slot; null while unknown (no valid time yet / loading). */
  availableRoomIds: Set<string> | null;
  /** Current attendee count, to flag rooms that are too small. */
  attendeeCount: number;
  onSelect: (roomId: string) => void;
  onClose: () => void;
};

/** Room list with capacity and "Booked" / "Too small" flags for the chosen slot. */
export function RoomPickerModal({
  visible,
  rooms,
  isLoading,
  selectedRoomId,
  availableRoomIds,
  attendeeCount,
  onSelect,
  onClose,
}: RoomPickerModalProps) {
  return (
    <ModalSheet visible={visible} title="Choose a room" onClose={onClose}>
      {isLoading ? (
        <Text className="py-8 text-center text-caption text-fg-soft">Loading rooms…</Text>
      ) : rooms.length === 0 ? (
        <StateView variant="empty" icon="business-outline" title="No rooms available" isCompact />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(room) => room.id}
          style={{ maxHeight: 460 }}
          ItemSeparatorComponent={() => <View className="h-px bg-line-soft" />}
          renderItem={({ item: room }) => {
            const isSelected = room.id === selectedRoomId;
            const isBooked = availableRoomIds !== null && !availableRoomIds.has(room.id);
            const isTooSmall = attendeeCount > room.capacity;
            const isDisabled = isBooked && !isSelected;
            return (
              <Pressable
                onPress={() => {
                  onSelect(room.id);
                  onClose();
                }}
                disabled={isDisabled}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                className="flex-row items-center gap-3 py-3 active:bg-field"
                style={{ opacity: isDisabled ? 0.45 : 1 }}
              >
                {room.coverImageUrl ? (
                  <Image
                    source={{ uri: getRemoteImageUrl(room.coverImageUrl) }}
                    style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: colors.mutedBg }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-subtle">
                    <Ionicons name="business-outline" size={20} color={colors.textSubtle} />
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
                    {room.name}
                  </Text>
                  <Text className="text-label text-fg-soft" numberOfLines={1}>
                    {room.capacity} people{room.location ? ` · ${room.location}` : ""}
                  </Text>
                  {isBooked ? (
                    <Text className="text-label font-semibold text-error">Booked at this time</Text>
                  ) : isTooSmall ? (
                    <Text className="text-label font-semibold text-warning">Too small for {attendeeCount} people</Text>
                  ) : null}
                </View>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected ? "border-brand bg-brand" : "border-line-strong"
                  }`}
                >
                  {isSelected ? <Ionicons name="checkmark" size={14} color={colors.textInverse} /> : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ModalSheet>
  );
}
