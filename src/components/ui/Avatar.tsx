import { Image } from "expo-image";
import { useState } from "react";
import { Text, View } from "react-native";

import { getRemoteImageSource } from "@/lib/remoteImage";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles";

export type AvatarSize = 24 | 28 | 36 | 40 | 44 | 48 | 52 | 64 | 72 | 88;

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
};

const INITIALS_TEXT: Record<AvatarSize, string> = {
  24: "text-micro",
  28: "text-micro",
  36: "text-caption",
  40: "text-body-sm",
  44: "text-body",
  48: "text-headline",
  52: "text-headline",
  64: "text-display",
  72: "text-display",
  88: "text-display",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  return letters.toUpperCase();
}

/** Person photo, or their initials on a brand tint when there's no photo. */
export function Avatar({ name, imageUrl, size = 36 }: AvatarProps) {
  const accessToken = useAuthStore((state) => state.token);
  const imageSource = getRemoteImageSource(imageUrl, accessToken);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  if (imageSource && failedImageUrl !== imageUrl) {
    return (
      <Image
        source={imageSource}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mutedBg }}
        contentFit="cover"
        accessibilityLabel={name}
        onError={() => setFailedImageUrl(imageUrl ?? null)}
      />
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full bg-brand-subtle"
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={name}
    >
      <Text className={`${INITIALS_TEXT[size]} font-bold text-brand-strong`}>{initialsOf(name)}</Text>
    </View>
  );
}
