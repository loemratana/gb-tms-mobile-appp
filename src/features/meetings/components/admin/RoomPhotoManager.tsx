import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { RoomImage } from "@/features/meetings/types/meeting.types";
import { getRemoteImageUrl } from "@/lib/remoteImage";
import { colors } from "@/styles";

const THUMB_SIZE = 128;

type RoomPhotoManagerProps = {
  images: RoomImage[];
  remaining: number;
  isUploading: boolean;
  isBusy: boolean;
  onAdd: () => void;
  onSetCover: (imageId: string) => void;
  onMove: (imageId: string, step: -1 | 1) => void;
  onDelete: (imageId: string) => void;
};

function PhotoAction({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className="h-8 w-8 items-center justify-center rounded-full bg-subtle active:bg-line"
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
}

/** Horizontal photo strip: cover star, move left/right, delete, and an add tile. */
export function RoomPhotoManager({
  images,
  remaining,
  isUploading,
  isBusy,
  onAdd,
  onSetCover,
  onMove,
  onDelete,
}: RoomPhotoManagerProps) {
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {images.map((image, index) => (
          <View key={image.id} style={{ width: THUMB_SIZE }}>
            <View>
              <Image
                source={{ uri: getRemoteImageUrl(image.url) }}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE * 0.75, borderRadius: 12, backgroundColor: colors.mutedBg }}
                contentFit="cover"
                accessibilityLabel={`Room photo ${index + 1}${image.cover ? ", cover" : ""}`}
              />
              {image.cover ? (
                <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-brand px-2 py-0.5">
                  <Ionicons name="star" size={10} color={colors.textInverse} />
                  <Text className="text-micro font-bold text-white">Cover</Text>
                </View>
              ) : null}
            </View>
            <View className="mt-2 flex-row justify-between">
              <PhotoAction
                icon="chevron-back"
                label="Move earlier"
                disabled={isBusy || index === 0}
                onPress={() => onMove(image.id, -1)}
              />
              <PhotoAction
                icon={image.cover ? "star" : "star-outline"}
                label="Make cover"
                disabled={isBusy || image.cover}
                onPress={() => onSetCover(image.id)}
              />
              <PhotoAction
                icon="chevron-forward"
                label="Move later"
                disabled={isBusy || index === images.length - 1}
                onPress={() => onMove(image.id, 1)}
              />
              <PhotoAction icon="trash-outline" label="Delete photo" disabled={isBusy} onPress={() => onDelete(image.id)} />
            </View>
          </View>
        ))}

        {remaining > 0 ? (
          <Pressable
            onPress={onAdd}
            disabled={isUploading}
            accessibilityRole="button"
            accessibilityLabel="Add photos"
            className="items-center justify-center rounded-xl border border-dashed border-line-strong bg-field active:bg-subtle"
            style={{ width: THUMB_SIZE, height: THUMB_SIZE * 0.75 }}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.brand} />
            ) : (
              <>
                <Ionicons name="images-outline" size={24} color={colors.brand} />
                <Text className="mt-1 text-label font-semibold text-brand-strong">Add photos</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </ScrollView>

      <Text className="mt-2 text-label text-fg-soft">
        {images.length === 0
          ? "The first photo becomes the cover shown in the room list."
          : `${images.length} of ${images.length + remaining} photos · up to 5 MB each`}
      </Text>
      {images.length === 0 && !isUploading ? (
        <View className="mt-3">
          <Button label="Add photos" icon="images-outline" variant="outline" size="sm" isFullWidth={false} onPress={onAdd} />
        </View>
      ) : null}
    </View>
  );
}
