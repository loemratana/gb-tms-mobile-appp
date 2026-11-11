import { api, type ApiEnvelope } from "@/lib/api";
import type { PageResponse } from "@/features/tasks/types/task.types";
import type {
  AvailableRoomsParams,
  RoomImageUpload,
  RoomRequest,
  RoomResponse,
  RoomSearchParams,
} from "@/features/meetings/types/meeting.types";

export async function searchRooms(params: RoomSearchParams = {}): Promise<PageResponse<RoomResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<RoomResponse>>>("/rooms", { params });
  return data.data;
}

export async function getRoom(id: string): Promise<RoomResponse> {
  const { data } = await api.get<ApiEnvelope<RoomResponse>>(`/rooms/${id}`);
  return data.data;
}

/** Active rooms with no confirmed booking overlapping the slot, smallest first. */
export async function getAvailableRooms(params: AvailableRoomsParams): Promise<RoomResponse[]> {
  const { data } = await api.get<ApiEnvelope<RoomResponse[]>>("/rooms/available", { params });
  return data.data;
}

// ---- Admin (rooms:manage) ----

export async function createRoom(input: RoomRequest): Promise<RoomResponse> {
  const { data } = await api.post<ApiEnvelope<RoomResponse>>("/rooms", input);
  return data.data;
}

/** Full replace. The response's `warnings` lists future bookings the change affects. */
export async function updateRoom(id: string, input: RoomRequest): Promise<RoomResponse> {
  const { data } = await api.put<ApiEnvelope<RoomResponse>>(`/rooms/${id}`, input);
  return data.data;
}

/** Only rooms that were never booked; the server asks to set INACTIVE otherwise. */
export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/rooms/${id}`);
}

/** Up to 10 images per room, 5 MB each. The room's first image becomes its cover. */
export async function uploadRoomImages(id: string, files: RoomImageUpload[]): Promise<RoomResponse> {
  const formData = new FormData();
  for (const file of files) {
    // React Native's FormData takes { uri, name, type } for files.
    formData.append("files", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  }
  const { data } = await api.post<ApiEnvelope<RoomResponse>>(`/rooms/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // Several photos over mobile data take longer than the default 15 s.
    timeout: 60_000,
  });
  return data.data;
}

export async function setRoomCoverImage(roomId: string, imageId: string): Promise<RoomResponse> {
  const { data } = await api.patch<ApiEnvelope<RoomResponse>>(`/rooms/${roomId}/images/${imageId}/cover`);
  return data.data;
}

/** `imageIds` must list every image of the room, in the new order. */
export async function reorderRoomImages(roomId: string, imageIds: string[]): Promise<RoomResponse> {
  const { data } = await api.put<ApiEnvelope<RoomResponse>>(`/rooms/${roomId}/images/order`, { imageIds });
  return data.data;
}

export async function deleteRoomImage(roomId: string, imageId: string): Promise<RoomResponse> {
  const { data } = await api.delete<ApiEnvelope<RoomResponse>>(`/rooms/${roomId}/images/${imageId}`);
  return data.data;
}
