import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import {
  BottomSheetBackdrop,
  useBottomSheet,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { colors, componentRadius, palette, shadows } from "@/constants/theme";

/**
 * Shared bottom sheet chrome (backdrop, background, handle, header) so every
 * sheet in the app dims, rounds, and shadows the same way instead of each
 * screen reinventing its own opacity/radius/color values.
 */

export function SheetBackdrop({
  closeOnPress = true,
  ...props
}: BottomSheetBackdropProps & { closeOnPress?: boolean }) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.45}
      pressBehavior={closeOnPress ? "close" : "none"}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: palette.slate[900] }]}
    />
  );
}

/** `backdropComponent` factory — pass `closeOnPress={false}` while a submit is in flight. */
export function useSheetBackdrop(closeOnPress = true) {
  return useCallback(
    (props: BottomSheetBackdropProps) => (
      <SheetBackdrop {...props} closeOnPress={closeOnPress} />
    ),
    [closeOnPress],
  );
}

export const sheetBackgroundStyle: ViewStyle = {
  backgroundColor: colors.card,
  borderTopLeftRadius: componentRadius.sheet,
  borderTopRightRadius: componentRadius.sheet,
  ...Platform.select(shadows.xl),
};

export const sheetHandleIndicatorStyle: ViewStyle = {
  backgroundColor: palette.gray[300],
  width: 40,
  height: 4,
};

type SheetHeaderProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  align?: "left" | "center";
};

/** Optional title/subtitle/close-button row for sheets that want a standard header. */
export function SheetHeader({ title, subtitle, onClose, align = "left" }: SheetHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1, alignItems: align === "center" ? "center" : "flex-start" }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <X size={18} color={colors.textSecondary} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Background for sheets that expand from a compact snap point to full screen
 * (radius eases to 0 as the sheet reaches the top), shared by every sheet
 * that uses that two-stage layout instead of each redefining it locally.
 */
export function ExpandableSheetBackground({ style }: BottomSheetBackgroundProps) {
  const { animatedIndex } = useBottomSheet();

  const animatedStyle = useAnimatedStyle(() => ({
    borderTopLeftRadius: interpolate(
      animatedIndex.value,
      [0, 1],
      [componentRadius.sheet, 0],
      Extrapolation.CLAMP,
    ),
    borderTopRightRadius: interpolate(
      animatedIndex.value,
      [0, 1],
      [componentRadius.sheet, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, animatedStyle, { backgroundColor: colors.card }]}
    />
  );
}

/** Handle indicator that fades out as an `ExpandableSheetBackground` sheet reaches full screen. */
export function ExpandableSheetHandle() {
  const { animatedIndex } = useBottomSheet();

  const handleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0, 0.75], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.expandableHandleWrap, handleStyle]}>
      <View style={styles.expandableHandleBar} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  closeButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: componentRadius.avatar,
    backgroundColor: colors.mutedBg,
  },
  expandableHandleWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  expandableHandleBar: {
    height: 4,
    width: 40,
    borderRadius: componentRadius.sheetHandle,
    backgroundColor: palette.gray[300],
  },
});
