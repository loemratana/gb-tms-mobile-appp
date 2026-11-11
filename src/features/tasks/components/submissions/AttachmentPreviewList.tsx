import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import {
  formatFileSize,
  getDocumentIcon,
  type WorkAttachment,
} from "@/features/tasks/types/workUpdate.types";
import { palette } from "@/styles";

const THUMB_SIZE = 76;

type AttachmentPreviewListProps = {
  attachments: WorkAttachment[];
  onRemove: (id: string) => void;
};

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${label}`}
      className="h-6 w-6 items-center justify-center rounded-full bg-black/60"
    >
      <Ionicons name="close" size={14} color={palette.white} />
    </Pressable>
  );
}

/** Picked-but-not-yet-submitted attachments: image thumbnails and file rows, each removable. */
export function AttachmentPreviewList({ attachments, onRemove }: AttachmentPreviewListProps) {
  const [preview, setPreview] = useState<WorkAttachment | null>(null);

  if (attachments.length === 0) return null;

  const images = attachments.filter((item) => item.kind === "image");
  const documents = attachments.filter((item) => item.kind === "document");

  return (
    <View className="mt-3 gap-3">
      {images.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {images.map((item) => (
            <View key={item.id}>
              <Pressable
                onPress={() => setPreview(item)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Preview ${item.name}`}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: 12,
                    backgroundColor: palette.gray[100],
                  }}
                  contentFit="cover"
                />
              </Pressable>
              <View className="absolute right-1 top-1">
                <RemoveButton label={item.name} onPress={() => onRemove(item.id)} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {documents.length > 0 ? (
        <View className="overflow-hidden rounded-xl border border-line">
          {documents.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center gap-3 bg-surface px-3 py-2.5 ${
                index > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-subtle">
                <Ionicons
                  name={getDocumentIcon(item.mimeType, item.name)}
                  size={18}
                  color={palette.gray[600]}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-caption font-medium text-fg" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-micro text-fg-faint">{formatFileSize(item.size)}</Text>
              </View>
              <Pressable
                onPress={() => onRemove(item.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-subtle"
              >
                <Ionicons name="close" size={18} color={palette.gray[500]} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <ImageViewerModal
        uri={preview?.uri ?? null}
        title={preview?.name}
        onClose={() => setPreview(null)}
      />
    </View>
  );
}
