import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";

type RejectReasonModalProps = {
  visible: boolean;
  taskTitle?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const INPUT_STYLE = {
  minHeight: 120,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "#F9FAFB",
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 14,
  color: "#111827",
  textAlignVertical: "top" as const,
};

export function RejectReasonModal({
  visible,
  taskTitle,
  submitting = false,
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["58%"], []);

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) {
      setReason("");
      setError("");
    }
  }

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    if (!submitting) {
      onClose();
    }
  }, [onClose, submitting]);

  const renderBackdrop = useSheetBackdrop(!submitting);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Please enter a reason (at least 5 characters).");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!submitting}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <SheetHeader
          title="Reject Submission"
          subtitle={taskTitle}
          onClose={submitting ? undefined : onClose}
        />

        <Text className="mb-2 text-[13px] font-semibold text-[#374151]">
          Reason for rejection *
        </Text>
        <BottomSheetTextInput
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            if (error) setError("");
          }}
          placeholder="Explain what needs to be fixed..."
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!submitting}
          style={INPUT_STYLE}
        />
        {error ? (
          <Text className="mt-2 text-[12px] text-[#EF4444]">{error}</Text>
        ) : (
          <Text className="mt-2 text-[12px] text-[#9CA3AF]">
            The employee will see this reason and can resubmit.
          </Text>
        )}

        <View className="mt-5 flex-row gap-3">
          <Pressable
            onPress={onClose}
            disabled={submitting}
            className="h-12 flex-1 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Text className="text-[14px] font-semibold text-[#374151]">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            disabled={submitting}
            className="h-12 flex-1 items-center justify-center rounded-full bg-[#EF4444]"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[14px] font-semibold text-white">
                Reject Task
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
