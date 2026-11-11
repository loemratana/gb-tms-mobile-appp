import type { ReactNode } from "react";
import { Modal, Platform, Pressable, Text, View, type DimensionValue } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, componentRadius } from "@/styles";

import { IconButton } from "./IconButton";
import { sheetBackgroundStyle, sheetHandleIndicatorStyle } from "./BottomSheet";

type ModalSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /**
   * Turns the header into "Cancel · Title · Done" for pickers that need an explicit confirm
   * (e.g. an iOS spinner). Without it the header is the title and a close button.
   */
  onConfirm?: () => void;
  confirmLabel?: string;
  /** Pinned under the content, e.g. a Confirm button. */
  footer?: ReactNode;
  /** Drop the side padding when rows run edge to edge. */
  isFlush?: boolean;
  maxHeight?: DimensionValue;
  children: ReactNode;
};

/**
 * Bottom panel for pickers that open over other sheets (create task, reminders, meeting form).
 * Built on RN `Modal` (+ `FullWindowOverlay` on iOS) so it reliably layers above @gorhom sheets,
 * with the same backdrop, corners, handle and header as those sheets so both feel like one thing.
 */
export function ModalSheet({
  visible,
  title,
  onClose,
  onConfirm,
  confirmLabel = "Done",
  footer,
  isFlush = false,
  maxHeight = "85%",
  children,
}: ModalSheetProps) {
  const insets = useSafeAreaInsets();
  const sidePadding = isFlush ? "" : "px-4";

  const content = (
    <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
      <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`} />
      <View style={[sheetBackgroundStyle, { maxHeight, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View className="items-center pb-1 pt-2.5">
          <View style={[sheetHandleIndicatorStyle, { borderRadius: componentRadius.sheetHandle }]} />
        </View>

        {onConfirm ? (
          <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" className="min-w-16">
              <Text className="text-headline text-fg-soft">Cancel</Text>
            </Pressable>
            <Text className="text-headline font-semibold text-fg" accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={onConfirm} hitSlop={8} accessibilityRole="button" className="min-w-16 items-end">
              <Text className="text-headline font-semibold text-brand-strong">{confirmLabel}</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center justify-between pb-2 pl-4 pr-2">
            <Text className="flex-1 text-title font-semibold text-fg" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Text>
            <IconButton icon="close" variant="subtle" accessibilityLabel="Close" onPress={onClose} />
          </View>
        )}

        <View className={`shrink ${sidePadding}`}>{children}</View>
        {footer ? <View className="px-4 pt-3">{footer}</View> : null}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {Platform.OS === "ios" ? <FullWindowOverlay>{content}</FullWindowOverlay> : content}
    </Modal>
  );
}
