import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, Text, View } from "react-native";

import {
  isImageMime,
  type WorkAttachment,
} from "@/features/employee/types/workUpdate";

type AttachmentUploadAreaProps = {
  onAdd: (files: WorkAttachment[]) => void;
};

function createId() {
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

export function AttachmentUploadArea({ onAdd }: AttachmentUploadAreaProps) {
  const uploadImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to upload images."
      );
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
        })
      )
    );
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow camera access to take a screenshot or photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

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

  const uploadFile = async () => {
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
          })
        )
      );
    } catch {
      Alert.alert("Upload failed", "Could not open the file picker.");
    }
  };

  return (
    <View
      className="items-center rounded-2xl bg-[#F9FAFB] px-4 py-6"
      style={{
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
      }}
    >
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">
        <Ionicons name="cloud-upload-outline" size={24} color="#2563EB" />
      </View>

      <Text className="text-[15px] font-bold text-[#111827]">
        Upload attachments
      </Text>
      <Text className="mt-1 text-center text-[12px] text-[#6B7280]">
        Images, PDFs, DOCX, reports, and screenshots
      </Text>

      <View className="mt-4 w-full flex-row flex-wrap justify-center gap-2">
        <Pressable
          onPress={uploadImage}
          accessibilityRole="button"
          accessibilityLabel="Upload image"
          className="flex-row items-center rounded-full bg-white px-3.5 py-2"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <Ionicons name="image-outline" size={16} color="#2563EB" />
          <Text className="ml-1.5 text-[12px] font-semibold text-[#2563EB]">
            Upload Image
          </Text>
        </Pressable>

        <Pressable
          onPress={uploadFile}
          accessibilityRole="button"
          accessibilityLabel="Upload file"
          className="flex-row items-center rounded-full bg-white px-3.5 py-2"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <Ionicons name="document-outline" size={16} color="#111827" />
          <Text className="ml-1.5 text-[12px] font-semibold text-[#111827]">
            Upload File
          </Text>
        </Pressable>

        <Pressable
          onPress={openCamera}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
          className="flex-row items-center rounded-full bg-white px-3.5 py-2"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <Ionicons name="camera-outline" size={16} color="#16A34A" />
          <Text className="ml-1.5 text-[12px] font-semibold text-[#16A34A]">
            Open Camera
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
