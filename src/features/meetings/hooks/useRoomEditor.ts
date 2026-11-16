import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "react-native";

import { getRoomEditorPath } from "@/features/auth/utils/navigation";
import { useRoomMutations } from "@/features/meetings/hooks/useRoomMutations";
import { roomFormSchema, type RoomFormValues } from "@/features/meetings/schemas/roomForm.schema";
import type { RoomFacility, RoomImageUpload, RoomRequest, RoomResponse, RoomStatus } from "@/features/meetings/types/meeting.types";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "@/stores/toastStore";

/** Server limits (app.booking.max-images-per-room / max-image-size-bytes). */
export const ROOM_MAX_IMAGES = 10;
const ROOM_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function toFormValues(room: RoomResponse | undefined): RoomFormValues {
  return {
    name: room?.name ?? "",
    code: room?.code ?? "",
    location: room?.location ?? "",
    description: room?.description ?? "",
    capacity: room ? String(room.capacity) : "",
    status: room?.status ?? "ACTIVE",
    facilities: room?.facilities ?? [],
  };
}

function toRequest(values: RoomFormValues): RoomRequest {
  return {
    name: values.name.trim(),
    code: values.code.trim() || undefined,
    location: values.location.trim() || undefined,
    description: values.description.trim() || undefined,
    capacity: Number(values.capacity),
    status: values.status,
    facilities: values.facilities,
  };
}

function toUpload(asset: ImagePicker.ImagePickerAsset, index: number): RoomImageUpload {
  const mimeType = asset.mimeType ?? "image/jpeg";
  const extension = mimeType.split("/")[1] ?? "jpg";
  return { uri: asset.uri, name: asset.fileName ?? `room-photo-${Date.now()}-${index}.${extension}`, mimeType };
}

/**
 * Create / edit a room. `room` is the live cached room (undefined when creating): the form
 * starts from it once, while the photo section always reflects the latest server copy.
 */
export function useRoomEditor(room: RoomResponse | undefined) {
  const router = useRouter();
  const mutations = useRoomMutations();
  const roomId = room?.id;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: toFormValues(room),
  });
  const status = useWatch({ control, name: "status" });
  const facilities = useWatch({ control, name: "facilities" });

  const setStatus = (next: RoomStatus) => setValue("status", next, { shouldDirty: true });
  const toggleFacility = (facility: RoomFacility) =>
    setValue(
      "facilities",
      facilities.includes(facility) ? facilities.filter((item) => item !== facility) : [...facilities, facility],
      { shouldDirty: true },
    );

  const save = useCallback(() => {
    void handleSubmit(async (values) => {
      try {
        if (!roomId) {
          const created = await mutations.create.mutateAsync(toRequest(values));
          // Photos can only be attached to a saved room, so continue in its editor.
          router.replace(getRoomEditorPath(created.id));
          toast.success("Room created", `"${created.name}" is ready. Add a few photos so people recognise it.`);
          return;
        }
        const saved = await mutations.update.mutateAsync({ id: roomId, input: toRequest(values) });
        router.back();
        if (saved.warnings?.length) {
          Alert.alert("Room saved — check these bookings", saved.warnings.join("\n\n"));
        }
      } catch (error) {
        toast.error("Couldn't save the room", getApiErrorMessage(error));
      }
    })();
  }, [handleSubmit, roomId, mutations.create, mutations.update, router]);

  const confirmDelete = () => {
    if (!room) return;
    Alert.alert(
      "Delete this room?",
      `"${room.name}" and its photos will be removed. Rooms that were ever booked can't be deleted — set them to Inactive instead.`,
      [
        { text: "Keep room", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            mutations.remove.mutate(room.id, {
              onSuccess: () => router.back(),
              onError: (error) => Alert.alert("Couldn't delete the room", getApiErrorMessage(error)),
            }),
        },
      ],
    );
  };

  // ---- Photos ----
  const imageCount = room?.images.length ?? 0;
  const remainingImages = ROOM_MAX_IMAGES - imageCount;

  const addPhotos = async () => {
    if (!roomId) return;
    if (remainingImages <= 0) {
      toast.warning("Photo limit reached", `A room can have at most ${ROOM_MAX_IMAGES} photos. Delete one to add another.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.warning("Permission needed", "Allow photo library access to add room photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingImages,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;

    const assets = result.assets.slice(0, remainingImages);
    const tooLarge = assets.filter((asset) => (asset.fileSize ?? 0) > ROOM_MAX_IMAGE_BYTES);
    const files = assets.filter((asset) => !tooLarge.includes(asset)).map(toUpload);
    if (tooLarge.length > 0) {
      toast.warning("Some photos are too large", `${tooLarge.length} photo(s) are over 5 MB and were skipped.`);
    }
    if (files.length === 0) return;

    mutations.uploadImages.mutate(
      { roomId, files },
      { onError: (error) => toast.error("Couldn't upload photos", getApiErrorMessage(error)) },
    );
  };

  const setCover = (imageId: string) => {
    if (!roomId) return;
    mutations.setCover.mutate(
      { roomId, imageId },
      { onError: (error) => toast.error("Couldn't change the cover", getApiErrorMessage(error)) },
    );
  };

  /** Moves a photo one place earlier (-1) or later (1). */
  const moveImage = (imageId: string, step: -1 | 1) => {
    if (!room) return;
    const ids = room.images.map((image) => image.id);
    const from = ids.indexOf(imageId);
    const to = from + step;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    mutations.reorderImages.mutate(
      { roomId: room.id, imageIds: ids },
      { onError: (error) => toast.error("Couldn't reorder photos", getApiErrorMessage(error)) },
    );
  };

  const confirmDeleteImage = (imageId: string) => {
    if (!roomId) return;
    Alert.alert("Delete this photo?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          mutations.deleteImage.mutate(
            { roomId, imageId },
            { onError: (error) => Alert.alert("Couldn't delete the photo", getApiErrorMessage(error)) },
          ),
      },
    ]);
  };

  return {
    isEdit: Boolean(room),
    control,
    errors,
    isSubmitting,
    isDirty,
    status,
    facilities,
    setStatus,
    toggleFacility,
    save,
    confirmDelete,
    isDeleting: mutations.remove.isPending,
    images: room?.images ?? [],
    remainingImages,
    isUploading: mutations.uploadImages.isPending,
    isUpdatingImages:
      mutations.setCover.isPending || mutations.reorderImages.isPending || mutations.deleteImage.isPending,
    addPhotos: () => void addPhotos(),
    setCover,
    moveImage,
    confirmDeleteImage,
  };
}
