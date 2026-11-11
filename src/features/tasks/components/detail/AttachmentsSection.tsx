import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { AttachmentUploadArea } from "@/features/tasks/components/submissions/AttachmentUploadArea";
import {
  useDeleteTaskAttachment,
  useUploadTaskAttachments,
} from "@/features/tasks/hooks/useTaskMutations";
import {
  formatAttachmentSize,
  isImageAttachment,
} from "@/features/tasks/utils/attachment.utils";
import type { TaskAttachmentResponse } from "@/features/tasks/types/attachment.types";
import type { WorkAttachment } from "@/features/tasks/types/workUpdate.types";
import { getApiErrorMessage } from "@/lib/api";
import { getRemoteImageSource, getRemoteImageUrl } from "@/lib/remoteImage";
import { MAX_ATTACHMENT_BYTES } from "@/services/attachments.service";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles";

type AttachmentsSectionProps = {
  taskId: string;
  attachments: TaskAttachmentResponse[];
  /** Used to offer delete on the viewer's own uploads. */
  currentUserId?: string;
  /** Managers may delete anyone's attachment on tasks they can update; the server has the final say. */
  canDeleteAny?: boolean;
};

export function AttachmentsSection({
  taskId,
  attachments,
  currentUserId,
  canDeleteAny = false,
}: AttachmentsSectionProps) {
  const accessToken = useAuthStore((state) => state.token);
  const [imagePreview, setImagePreview] = useState<TaskAttachmentResponse | null>(
    null
  );
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const uploadMutation = useUploadTaskAttachments(taskId);
  const deleteMutation = useDeleteTaskAttachment(taskId);
  const isUploading = uploadMutation.isPending;

  const handlePress = async (file: TaskAttachmentResponse) => {
    if (isImageAttachment(file)) {
      setImagePreview(file);
      return;
    }

    setOpeningId(file.id);
    try {
      await WebBrowser.openBrowserAsync(getRemoteImageUrl(file.downloadUrl), {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        enableBarCollapsing: true,
      });
    } catch {
      Alert.alert("Can't open file", `${file.originalName} couldn't be opened on this device.`);
    } finally {
      setOpeningId(null);
    }
  };

  const handleAdd = (files: WorkAttachment[]) => {
    const tooLarge = files.filter((file) => file.size > MAX_ATTACHMENT_BYTES);
    const toUpload = files.filter((file) => file.size <= MAX_ATTACHMENT_BYTES);
    if (tooLarge.length > 0) {
      Alert.alert(
        "File too large",
        `${tooLarge.map((file) => file.name).join(", ")} ${
          tooLarge.length === 1 ? "is" : "are"
        } over the 20 MB limit and won't be attached.`
      );
    }
    if (toUpload.length === 0) return;

    setIsPickerOpen(false);
    uploadMutation.mutate(
      toUpload.map((file) => ({ uri: file.uri, name: file.name, mimeType: file.mimeType })),
      {
        onSuccess: ({ uploaded, failed, total, firstError }) => {
          if (failed === 0) return;
          const reason = firstError ? getApiErrorMessage(firstError) : undefined;
          Alert.alert(
            uploaded === 0 ? "Upload failed" : "Some files weren't attached",
            `${failed} of ${total} file${total === 1 ? "" : "s"} couldn't be uploaded.${
              reason ? `\n\n${reason}` : ""
            }`
          );
        },
        onError: (error) => Alert.alert("Upload failed", getApiErrorMessage(error)),
      }
    );
  };

  const canDelete = (file: TaskAttachmentResponse) =>
    canDeleteAny || (Boolean(currentUserId) && file.uploadedByUserId === currentUserId);

  const confirmDelete = (file: TaskAttachmentResponse) => {
    Alert.alert("Delete attachment?", `"${file.originalName}" will be removed from this task.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMutation.mutate(file.id, {
            onError: (error) => Alert.alert("Couldn't delete", getApiErrorMessage(error)),
          }),
      },
    ]);
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-body font-semibold text-fg">
          Attachments{attachments.length > 0 ? ` (${attachments.length})` : ""}
        </Text>
        {isUploading ? (
          <View className="flex-row items-center gap-1.5">
            <ActivityIndicator size="small" color={colors.brand} />
            <Text className="text-label font-semibold text-fg-soft">Uploading…</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsPickerOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={isPickerOpen ? "Cancel attaching" : "Attach file"}
            className="flex-row items-center gap-1 rounded-full bg-brand-subtle px-3 py-1.5"
          >
            {isPickerOpen ? (
              <Ionicons name="close" size={14} color={colors.brand} />
            ) : (
              <Ionicons name="attach" size={14} color={colors.brand} />
            )}
            <Text className="text-label font-semibold text-brand-strong">
              {isPickerOpen ? "Cancel" : "Attach"}
            </Text>
          </Pressable>
        )}
      </View>

      {isPickerOpen ? (
        <View className="mb-3">
          <AttachmentUploadArea onAdd={handleAdd} isDisabled={isUploading} />
          <Text className="mt-2 text-micro text-fg-faint">
            Images, PDF, Word, Excel, text or zip files, up to 20 MB each.
          </Text>
        </View>
      ) : null}

      {attachments.length === 0 ? (
        isPickerOpen ? null : (
          <Text className="text-caption text-fg-faint">No files attached yet.</Text>
        )
      ) : (
        <View className="gap-2.5">
          {attachments.map((file) => {
            const isOpening = openingId === file.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === file.id;
            const isImage = isImageAttachment(file);
            const deletable = canDelete(file);

            return (
              <Pressable
                key={file.id}
                onPress={() => handlePress(file)}
                onLongPress={deletable ? () => confirmDelete(file) : undefined}
                disabled={isOpening || isDeleting}
                accessibilityRole="button"
                accessibilityLabel={`Preview ${file.originalName}`}
                accessibilityHint={deletable ? "Long press to delete" : undefined}
                className="flex-row items-center rounded-2xl border border-line-soft p-3"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                {isImage ? (
                  <Image
                    source={getRemoteImageSource(file.downloadUrl, accessToken)}
                    className="mr-3 rounded-xl bg-subtle"
                    style={{ width: 56, height: 56 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-brand-subtle">
                    <Ionicons name="document-text-outline" size={22} color={colors.brand} />
                  </View>
                )}

                <View className="min-w-0 flex-1">
                  <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
                    {file.originalName}
                  </Text>
                  <Text className="mt-0.5 text-label text-fg-faint" numberOfLines={1}>
                    {formatAttachmentSize(file.fileSize)}
                    {file.uploadedByName ? ` · ${file.uploadedByName}` : ""}
                  </Text>
                  <Text className="mt-1 text-micro font-medium text-brand-strong">
                    {deletable ? "Tap to preview · hold to delete" : "Tap to preview"}
                  </Text>
                </View>

                {isOpening || isDeleting ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <ImageViewerModal
        uri={imagePreview?.downloadUrl ?? null}
        accessToken={accessToken}
        title={imagePreview?.originalName}
        subtitle={imagePreview ? formatAttachmentSize(imagePreview.fileSize) : undefined}
        onClose={() => setImagePreview(null)}
      />
    </View>
  );
}
