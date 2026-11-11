import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SheetHeader,
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { PRIORITY_OPTIONS } from "@/features/tasks/utils/priorityOptions";
import type { Priority } from "@/features/tasks/types/task.types";
import { colors, priorityTone, toneColors } from "@/styles";

export type TaskPrioritySheetRef = {
  present: () => void;
  dismiss: () => void;
};

type TaskPrioritySheetProps = {
  /** The task's current priority; shown with a check mark. */
  current: Priority;
  onSelect: (priority: Priority) => void;
};

/** Pick a task's priority from a list, replacing a native alert menu. */
export const TaskPrioritySheet = forwardRef<TaskPrioritySheetRef, TaskPrioritySheetProps>(
  function TaskPrioritySheet({ current, onSelect }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const renderBackdrop = useSheetBackdrop();

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleSelect = (priority: Priority) => {
      sheetRef.current?.dismiss();
      if (priority !== current) onSelect(priority);
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={sheetBackgroundStyle}
        handleIndicatorStyle={sheetHandleIndicatorStyle}
      >
        <BottomSheetView
          style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: Math.max(insets.bottom + 12, 24) }}
        >
          <SheetHeader title="Change priority" onClose={() => sheetRef.current?.dismiss()} />

          <View
            className="overflow-hidden rounded-2xl border border-line bg-surface"
            accessibilityRole="radiogroup"
            accessibilityLabel="Priority"
          >
            {PRIORITY_OPTIONS.map((option, index) => {
              const isSelected = option.id === current;
              const tone = toneColors[priorityTone[option.id]];
              const isLast = index === PRIORITY_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${option.label} priority`}
                  className={`flex-row items-center px-3.5 py-3.5 ${isLast ? "" : "border-b border-line-soft"}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: tone.subtle }}
                  >
                    <Ionicons name="flag" size={16} color={tone.color} />
                  </View>
                  <Text className={`flex-1 text-body text-fg ${isSelected ? "font-semibold" : "font-medium"}`}>
                    {option.label}
                  </Text>
                  {isSelected ? <Ionicons name="checkmark" size={20} color={colors.brand} /> : null}
                </Pressable>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
