import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { TaskReminderSettingsCard } from "@/features/tasks/components/TaskReminderSettingsCard";

export type TaskReminderSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type TaskReminderSheetProps = {
  taskId: string | undefined;
};

export const TaskReminderSheet = forwardRef<TaskReminderSheetRef, TaskReminderSheetProps>(
  function TaskReminderSheet({ taskId }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["75%"], []);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useSheetBackdrop();

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={sheetBackgroundStyle}
        handleIndicatorStyle={sheetHandleIndicatorStyle}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom + 12, 24),
          }}
        >
          <View className="mb-1">
            <SheetHeader
              title="Reminders"
              onClose={() => sheetRef.current?.dismiss()}
            />
          </View>

          <TaskReminderSettingsCard taskId={taskId} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
