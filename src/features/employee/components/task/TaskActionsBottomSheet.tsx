import {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";

export type TaskActionsBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type TaskActionsBottomSheetProps = {
  onSubmitWork: () => void;
  onUpdateStatus: () => void;
};

const ACTIONS = [
  {
    key: "submit_work",
    title: "Submit Work",
    subtitle: "Share progress, attachments, and notes",
    icon: "create-outline" as const,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    key: "update_status",
    title: "Update Task Status",
    subtitle: "Change pending, in progress, done, and more",
    icon: "swap-vertical-outline" as const,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
] as const;

export const TaskActionsBottomSheet = forwardRef<
  TaskActionsBottomSheetRef,
  TaskActionsBottomSheetProps
>(function TaskActionsBottomSheet({ onSubmitWork, onUpdateStatus }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["34%"], []);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const handleAction = (key: (typeof ACTIONS)[number]["key"]) => {
    sheetRef.current?.dismiss();
    // Let the actions sheet close before opening the next one.
    setTimeout(() => {
      if (key === "submit_work") onSubmitWork();
      else onUpdateStatus();
    }, 280);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom + 16, 32),
        }}
      >
        <SheetHeader
          title="Task Actions"
          subtitle="Choose what you want to do"
          align="center"
        />

        <View className="gap-3">
          {ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => handleAction(action.key)}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              className="flex-row items-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3.5"
            >
              <View
                className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: action.bg }}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>

              <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">
                  {action.title}
                </Text>
                <Text className="mt-0.5 text-[12px] text-[#6B7280]">
                  {action.subtitle}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
