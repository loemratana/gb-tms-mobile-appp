import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { ComponentProps } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { isImageMime, type WorkAttachment } from "@/features/tasks/types/workUpdate.types";
import { palette } from "@/styles";

type AttachmentUploadAreaProps = {
  onAdd: (files: WorkAttachment[]) => void;
  isDisabled?: boolean;
};

function createId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toAttachment(asset: {
  uri: string;
  name?: string | null;
  size?: number | null;
  mimeType?: string | null;
}): WorkAttachment {
  const name = asset.name?.trim() || asset.uri.split("/").pop() || "file";
  const mimeType = asset.mimeType ?? "application/octet-stream";
  return {
    id: createId(),
    uri: asset.uri,
    name,
    size: asset.size ?? 0,
    mimeType,
    kind: isImageMime(mimeType, name) ? "image" : "document",
  };
}

type SourceButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  isDisabled: boolean;
  onPress: () => void;
};

function SourceButton({ icon, label, isDisabled, onPress }: SourceButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      className="h-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-field active:bg-subtle"
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      <Ionicons name={icon} size={20} color={palette.gray[700]} />
      <Text className="text-label font-semibold text-fg-sub">{label}</Text>
    </Pressable>
  );
}

/** Three ways to attach work: photo library, camera, or files. */
export function AttachmentUploadArea({ onAdd, isDisabled = false }: AttachmentUploadAreaProps) {
  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to attach images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;

    onAdd(
      result.assets.map((asset) =>
        toAttachment({
          uri: asset.uri,
          name: asset.fileName,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        }),
      ),
    );
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.85 });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    onAdd([
      toAttachment({
        uri: asset.uri,
        name: asset.fileName ?? `photo-${Date.now()}.jpg`,
        size: asset.fileSize,
        mimeType: asset.mimeType ?? "image/jpeg",
      }),
    ]);
  };

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "image/*",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;

      onAdd(
        result.assets.map((asset) =>
          toAttachment({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            mimeType: asset.mimeType,
          }),
        ),
      );
    } catch {
      Alert.alert("Couldn't open files", "The file picker could not be opened.");
    }
  };

  return (
    <View className="flex-row gap-2">
      <SourceButton icon="images-outline" label="Photos" isDisabled={isDisabled} onPress={() => void pickPhotos()} />
      <SourceButton icon="camera-outline" label="Camera" isDisabled={isDisabled} onPress={() => void takePhoto()} />
      <SourceButton icon="document-attach-outline" label="Files" isDisabled={isDisabled} onPress={() => void pickFiles()} />
    </View>
  );
}
