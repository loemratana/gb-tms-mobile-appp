import { useMutation, useQueryClient } from "@tanstack/react-query";

import { meetingKeys, roomKeys } from "@/features/meetings/hooks/useMeetings";
import type { RoomImageUpload, RoomRequest, RoomResponse } from "@/features/meetings/types/meeting.types";
import {
  createRoom,
  deleteRoom,
  deleteRoomImage,
  reorderRoomImages,
  setRoomCoverImage,
  updateRoom,
  uploadRoomImages,
} from "@/services/rooms.service";

/**
 * Admin room mutations. Every image call returns the whole updated room, which goes
 * straight into the detail cache; lists (and meetings showing room names/photos) refetch.
 */
export function useRoomMutations() {
  const queryClient = useQueryClient();

  const applyRoom = (room: RoomResponse) => {
    queryClient.setQueryData(roomKeys.detail(room.id), room);
    void queryClient.invalidateQueries({ queryKey: [...roomKeys.all, "list"] });
    void queryClient.invalidateQueries({ queryKey: [...roomKeys.all, "available"] });
    void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
  };

  const create = useMutation({
    mutationFn: (input: RoomRequest) => createRoom(input),
    onSuccess: applyRoom,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoomRequest }) => updateRoom(id, input),
    onSuccess: applyRoom,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: roomKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });

  const uploadImages = useMutation({
    mutationFn: ({ roomId, files }: { roomId: string; files: RoomImageUpload[] }) => uploadRoomImages(roomId, files),
    onSuccess: applyRoom,
  });

  const setCover = useMutation({
    mutationFn: ({ roomId, imageId }: { roomId: string; imageId: string }) => setRoomCoverImage(roomId, imageId),
    onSuccess: applyRoom,
  });

  const reorderImages = useMutation({
    mutationFn: ({ roomId, imageIds }: { roomId: string; imageIds: string[] }) => reorderRoomImages(roomId, imageIds),
    onSuccess: applyRoom,
  });

  const deleteImage = useMutation({
    mutationFn: ({ roomId, imageId }: { roomId: string; imageId: string }) => deleteRoomImage(roomId, imageId),
    onSuccess: applyRoom,
  });

  return { create, update, remove, uploadImages, setCover, reorderImages, deleteImage };
}
