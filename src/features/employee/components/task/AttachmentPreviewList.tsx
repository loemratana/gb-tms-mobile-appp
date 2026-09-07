import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatFileSize,
  getDocumentIcon,
  type WorkAttachment,
} from "@/features/employee/types/workUpdate";

type AttachmentPreviewListProps = {
  attachments: WorkAttachment[];
  onRemove: (id: string) => void;
};

export function AttachmentPreviewList({
  attachments,
  onRemove,
}: AttachmentPreviewListProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  const images = attachments.filter((item) => item.kind === "image");
  const documents = attachments.filter((item) => item.kind === "document");
  const thumbSize = (width - 32 - 32 - 16) / 3;

  return (
    <View className="mt-3 gap-3">
      {images.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {images.map((item) => (
            <View key={item.id} style={{ width: thumbSize }}>
              <Pressable
                onPress={() => setPreviewUri(item.uri)}
                accessibilityRole="button"
                accessibilityLabel={`Preview ${item.name}`}
              >
                <Image
                  source={{ uri: item.uri }}
                  className="rounded-2xl bg-[#F3F4F6]"
                  style={{ width: thumbSize, height: thumbSize }}
                />
              </Pressable>
              <Pressable
                onPress={() => onRemove(item.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
                className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/60"
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {documents.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Ionicons
              name={getDocumentIcon(item.mimeType, item.name)}
              size={20}
              color="#2563EB"
            />
          </View>

          <View className="min-w-0 flex-1">
            <Text
              className="text-[13px] font-semibold text-[#111827]"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#6B7280]">
              {formatFileSize(item.size)}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                item.name,
                `${formatFileSize(item.size)}\nReady to submit with your work update.`
              )
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Preview ${item.name}`}
            className="mr-1 h-9 w-9 items-center justify-center rounded-full bg-white"
            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
          >
            <Ionicons name="eye-outline" size={16} color="#6B7280" />
          </Pressable>

          <Pressable
            onPress={() => onRemove(item.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name}`}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      ))}

      <Modal
        visible={Boolean(previewUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <View
          className="flex-1 bg-black/90"
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View className="flex-row items-center justify-end px-4 pb-3">
            <Pressable
              onPress={() => setPreviewUri(null)}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              resizeMode="contain"
              className="flex-1"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
