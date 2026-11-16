import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useEffect, type ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";

import { useToastStore, type ToastType } from "@/stores/toastStore";
import { colors, palette, shadows, toneColors, type Tone } from "@/styles";

/** Errors stay a little longer: they're the ones people need to read. */
const DURATION_MS: Record<ToastType, number> = { success: 3000, info: 3500, warning: 4500, error: 5000 };

const STYLE: Record<ToastType, { tone: Tone; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { tone: "success", icon: "checkmark" },
  error: { tone: "error", icon: "close" },
  warning: { tone: "warning", icon: "alert" },
  info: { tone: "info", icon: "information" },
};

const HAPTIC: Record<ToastType, Haptics.NotificationFeedbackType | null> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: null,
};

/**
 * Shows the current toast (see `toast` in stores/toastStore) sliding down from the top. Mount once at
 * the app root. On iOS it renders in a full-window overlay, so it appears above popups and sheets.
 */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const current = useToastStore((state) => state.current);
  const hide = useToastStore((state) => state.hide);

  // Auto-hide, and a light vibration matching the outcome.
  useEffect(() => {
    if (!current) return;
    const haptic = HAPTIC[current.type];
    if (haptic !== null) void Haptics.notificationAsync(haptic);
    const timer = setTimeout(() => hide(current.id), DURATION_MS[current.type]);
    return () => clearTimeout(timer);
  }, [current, hide]);

  if (!current) return null;
  const style = STYLE[current.type];
  const tone = toneColors[style.tone];

  const content: ReactNode = (
    <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16 }}>
      <Animated.View
        key={current.id}
        entering={FadeInUp.duration(260)}
        exiting={FadeOutUp.duration(200)}
        style={{ ...Platform.select(shadows.lg) }}
      >
        <Pressable
          onPress={() => hide(current.id)}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={current.message ? `${current.title}. ${current.message}` : current.title}
          accessibilityHint="Tap to dismiss"
          className="flex-row items-center gap-3 rounded-2xl border border-line-soft bg-surface px-3.5 py-3"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: tone.color }}>
            <Ionicons name={style.icon} size={20} color={palette.white} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-body-sm font-semibold text-fg" numberOfLines={2}>
              {current.title}
            </Text>
            {current.message ? (
              <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={3}>
                {current.message}
              </Text>
            ) : null}
          </View>
          <Ionicons name="close" size={18} color={colors.textSubtle} />
        </Pressable>
      </Animated.View>
    </View>
  );

  return Platform.OS === "ios" ? <FullWindowOverlay>{content}</FullWindowOverlay> : content;
}
