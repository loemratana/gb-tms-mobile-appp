import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { FileText, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { TaskAttachment } from "@/features/manager/data/taskDetail";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
});

type AttachmentsSectionProps = {
  attachments: TaskAttachment[];
};

export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  const insets = useSafeAreaInsets();
  const [imagePreview, setImagePreview] = useState<TaskAttachment | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  const handlePress = async (file: TaskAttachment) => {
    if (file.type === "image") {
      setImagePreview(file);
      return;
    }

    setOpeningId(file.id);
    try {
      await WebBrowser.openBrowserAsync(file.uri, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        enableBarCollapsing: true,
      });
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <View>
      <Text className="mb-3 text-[15px] font-semibold text-[#111827]">
        Attachments
      </Text>

      <View className="gap-2.5">
        {attachments.map((file) => {
          const isOpening = openingId === file.id;

          return (
            <Pressable
              key={file.id}
              onPress={() => handlePress(file)}
              disabled={isOpening}
              accessibilityRole="button"
              accessibilityLabel={`Preview ${file.name}`}
              className="flex-row items-center rounded-2xl border border-[#F3F4F6] bg-white p-3"
              style={CARD_SHADOW}
            >
              {file.type === "image" ? (
                <Image
                  source={{ uri: file.uri }}
                  className="mr-3 rounded-xl bg-[#F3F4F6]"
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-[#EFF6FF]">
                  <FileText size={22} color="#2563EB" strokeWidth={2} />
                </View>
              )}

              <View className="min-w-0 flex-1">
                <Text className="text-[14px] font-semibold text-[#111827]" numberOfLines={1}>
                  {file.name}
                </Text>
                <Text className="mt-0.5 text-[12px] text-[#9CA3AF]">{file.size}</Text>
                <Text className="mt-1 text-[11px] font-medium text-[#32CD32]">
                  Tap to preview
                </Text>
              </View>

              {isOpening ? (
                <ActivityIndicator size="small" color="#32CD32" />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={Boolean(imagePreview)}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreview(null)}
      >
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="min-w-0 flex-1 pr-3">
              <Text className="text-[15px] font-semibold text-white" numberOfLines={1}>
                {imagePreview?.name}
              </Text>
              <Text className="mt-0.5 text-[12px] text-white/70">{imagePreview?.size}</Text>
            </View>
            <Pressable
              onPress={() => setImagePreview(null)}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
            >
              <X size={20} color="#FFFFFF" strokeWidth={2.2} />
            </Pressable>
          </View>

          {imagePreview ? (
            <Image
              source={{ uri: imagePreview.uri }}
              style={{ flex: 1, marginBottom: insets.bottom }}
              contentFit="contain"
              transition={200}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
