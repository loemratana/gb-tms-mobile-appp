import { Image } from "expo-image";
import { Modal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { getRemoteImageSource } from "@/lib/remoteImage";

type ImageViewerModalProps = {
  /** Image to show; `null` hides the viewer. */
  uri: string | null;
  accessToken?: string | null;
  title?: string;
  /** Second line under the title, e.g. the file size. */
  subtitle?: string;
  onClose: () => void;
};

/** Full-screen, letterboxed image preview on a dark backdrop. */
export function ImageViewerModal({
  uri,
  accessToken = null,
  title,
  subtitle,
  onClose,
}: ImageViewerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={Boolean(uri)} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 bg-black/95"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
      >
        <View className="flex-row items-center gap-3 px-4 pb-3">
          <View className="min-w-0 flex-1">
            <Text className="text-body-sm font-medium text-white/80" numberOfLines={1}>
              {title ?? ""}
            </Text>
            {subtitle ? <Text className="mt-0.5 text-label text-white/60">{subtitle}</Text> : null}
          </View>
          <IconButton icon="close" variant="overlay" accessibilityLabel="Close image" onPress={onClose} />
        </View>
        {uri ? (
          <Image
            source={getRemoteImageSource(uri, accessToken)}
            style={{ flex: 1 }}
            contentFit="contain"
            accessibilityLabel={title}
          />
        ) : null}
      </View>
    </Modal>
  );
}
