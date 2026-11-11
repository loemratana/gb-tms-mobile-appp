import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import type { ChipOption } from "@/components/ui/ChipRow";
import { getRoomEditorPath } from "@/features/auth/utils/navigation";
import { useRooms } from "@/features/meetings/hooks/useMeetings";
import type { RoomResponse, RoomStatus } from "@/features/meetings/types/meeting.types";
import { matchesQuery } from "@/features/meetings/utils/memberDirectory";
import { ROOM_STATUS_META, ROOM_STATUSES } from "@/features/meetings/utils/roomStatus";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { toneColors } from "@/styles";

export type RoomStatusFilter = "ALL" | RoomStatus;

/** Every room, any status (an office has a handful, so one page filtered locally is enough). */
const ALL_ROOMS_PARAMS = { size: 200 } as const;

export function useRoomManagement() {
  const router = useRouter();
  const rooms = useRooms(ALL_ROOMS_PARAMS);
  useRefetchOnFocus(rooms.refetch);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("ALL");

  const allRooms = useMemo(() => rooms.data ?? [], [rooms.data]);
  const visibleRooms = useMemo(
    () =>
      allRooms.filter(
        (room) =>
          (statusFilter === "ALL" || room.status === statusFilter) &&
          matchesQuery(query, room.name, room.code, room.location),
      ),
    [allRooms, statusFilter, query],
  );

  const statusOptions = useMemo<ChipOption<RoomStatusFilter>[]>(
    () => [
      { key: "ALL", label: "All", count: allRooms.length },
      ...ROOM_STATUSES.map((status) => ({
        key: status,
        label: ROOM_STATUS_META[status].label,
        color: toneColors[ROOM_STATUS_META[status].tone].color,
        count: allRooms.filter((room) => room.status === status).length,
      })),
    ],
    [allRooms],
  );

  return {
    rooms: visibleRooms,
    totalCount: allRooms.length,
    isLoading: rooms.isLoading,
    isError: rooms.isError,
    isRefreshing: rooms.isRefetching && !rooms.isLoading,
    refetch: () => void rooms.refetch(),
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    statusOptions,
    openRoom: (room: RoomResponse) => router.push(getRoomEditorPath(room.id)),
    addRoom: () => router.push(getRoomEditorPath("new")),
  };
}
