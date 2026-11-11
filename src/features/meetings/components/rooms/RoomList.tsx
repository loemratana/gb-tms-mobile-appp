import { View } from "react-native";

import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import type { RoomResponse } from "@/features/meetings/types/meeting.types";
import { RoomCard } from "./RoomCard";

type RoomListProps = {
  rooms: RoomResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onBook?: (room: RoomResponse) => void;
  emptyMessage?: string;
};

/** Rooms are few (an office has a handful), so a plain mapped list is enough. */
export function RoomList({ rooms, isLoading, isError, onRetry, onBook, emptyMessage }: RoomListProps) {
  if (isLoading) {
    return (
      <View className="gap-3" accessibilityLabel="Loading rooms">
        {[0, 1, 2].map((row) => (
          <SkeletonBlock key={row} height={144} radius={16} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <StateView
        variant="error"
        title="Couldn't load rooms"
        message="Check your connection and try again."
        actionLabel="Retry"
        onPressAction={onRetry}
      />
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <StateView
        variant="empty"
        icon="business-outline"
        title="No rooms yet"
        message={emptyMessage ?? "Ask an admin to add meeting rooms."}
      />
    );
  }

  return (
    <View className="gap-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onBook={onBook} />
      ))}
    </View>
  );
}
