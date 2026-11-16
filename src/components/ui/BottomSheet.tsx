import { useCallback, type ReactNode } from "react";
import { Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import {
  BottomSheetBackdrop,
  useBottomSheet,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { APP_FONT_FAMILY, colors, componentRadius, palette, shadows } from "@/styles";

import { IconButton } from "./IconButton";

/**
 * Shared bottom sheet chrome (backdrop, background, handle, header) so every
 * sheet in the app dims, rounds, and shadows the same way instead of each
 * screen reinventing its own opacity/radius/color values.
 */

export function SheetBackdrop({
  closeOnPress = true,
  onPress,
  ...props
}: BottomSheetBackdropProps & { closeOnPress?: boolean; onPress?: () => void }) {
  return (
    <BottomSheetBackdrop
      {...props}
      onPress={onPress}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.45}
      pressBehavior={closeOnPress ? "close" : "none"}
      style={[StyleSheet.absoluteFill, { backgroundColor: palette.slate[900] }]}
    />
  );
}

/**
 * `backdropComponent` factory — pass `closeOnPress={false}` while a submit is in flight.
 * With `onPress`, a tap calls it instead of closing (e.g. to ask before discarding a form).
 */
export function useSheetBackdrop(closeOnPress = true, onPress?: () => void) {
  return useCallback(
    (props: BottomSheetBackdropProps) => (
      <SheetBackdrop
        {...props}
        closeOnPress={closeOnPress && !onPress}
        onPress={closeOnPress ? onPress : undefined}
      />
    ),
    [closeOnPress, onPress],
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
        <IconButton icon="close" variant="subtle" accessibilityLabel="Close" onPress={onClose} />
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

  // The strip paints the sheet colour itself (rounded corners that flatten at full screen) so the
  // top of the sheet is never see-through, whatever the background component draws.
  const stripStyle = useAnimatedStyle(() => {
    const radius = interpolate(animatedIndex.value, [0, 1], [componentRadius.sheet, 0], Extrapolation.CLAMP);
    return { borderTopLeftRadius: radius, borderTopRightRadius: radius };
  });
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0, 0.75], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.expandableHandleWrap, { backgroundColor: colors.card }, stripStyle]}>
      <Animated.View style={[styles.expandableHandleBar, barStyle]} />
    </Animated.View>
  );
}

/**
 * Header area of an expandable sheet: as the sheet reaches full screen it gains top padding equal
 * to the status bar / notch (`topInset`), so the title never sits underneath it.
 */
export function ExpandableSheetHeader({ topInset, children }: { topInset: number; children: ReactNode }) {
  const { animatedIndex } = useBottomSheet();

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(animatedIndex.value, [0, 1], [0, topInset], Extrapolation.CLAMP),
  }));

  return <Animated.View style={containerStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: colors.textMuted,
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
