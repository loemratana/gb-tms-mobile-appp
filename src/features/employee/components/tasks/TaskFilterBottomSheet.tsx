import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { CalendarPickerModal } from "@/features/employee/components/tasks/CalendarPickerModal";
import { DatePreset } from "@/features/employee/components/tasks/DatePreset";
import { DateRangeField } from "@/features/employee/components/tasks/DateRangeField";
import { FilterActions } from "@/features/employee/components/tasks/FilterActions";
import { FilterSection } from "@/features/employee/components/tasks/FilterSection";
import {
  DATE_PRESETS,
  EMPTY_TASK_FILTERS,
  type DateFilterPreset,
  type TaskListFilters,
} from "@/features/employee/utils/taskFilters";

export type TaskFilterBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type PickerTarget = "from" | "to" | null;

type TaskFilterBottomSheetProps = {
  filters: TaskListFilters;
  onApply: (filters: TaskListFilters) => void;
};

function formatDisplayDate(value: string | null) {
  if (!value) return "Any date";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const TaskFilterBottomSheet = forwardRef<
  TaskFilterBottomSheetRef,
  TaskFilterBottomSheetProps
>(function TaskFilterBottomSheet({ filters, onApply }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TaskListFilters>(filters);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  useImperativeHandle(ref, () => ({
    present: () => {
      setDraft(filters);
      setPickerTarget(null);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const handleReset = () => {
    setDraft(EMPTY_TASK_FILTERS);
    setPickerTarget(null);
  };

  const handleApply = () => {
    onApply(draft);
    sheetRef.current?.dismiss();
  };

  const selectDatePreset = (preset: DateFilterPreset) => {
    setDraft((prev) => ({
      ...prev,
      datePreset: preset,
      dateFrom: null,
      dateTo: null,
    }));
    setPickerTarget(null);
  };

  const openDatePicker = (target: "from" | "to") => setPickerTarget(target);

  const onPickDate = (dateString: string) => {
    if (!pickerTarget) return;

    setDraft((prev) => {
      const next = {
        ...prev,
        datePreset: "all" as const,
        dateFrom: pickerTarget === "from" ? dateString : prev.dateFrom,
        dateTo: pickerTarget === "to" ? dateString : prev.dateTo,
      };

      // Keep range valid when from is after to.
      if (next.dateFrom && next.dateTo && next.dateFrom > next.dateTo) {
        if (pickerTarget === "from") next.dateTo = next.dateFrom;
        else next.dateFrom = next.dateTo;
      }

      return next;
    });
    setPickerTarget(null);
  };

  const selectedDate =
    pickerTarget === "from" ? draft.dateFrom : pickerTarget === "to" ? draft.dateTo : null;

  const hasCustomDate = Boolean(draft.dateFrom || draft.dateTo);

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        enableContentPanningGesture
        enableHandlePanningGesture
        backdropComponent={renderBackdrop}
        backgroundStyle={sheetBackgroundStyle}
        handleIndicatorStyle={sheetHandleIndicatorStyle}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
          }}
        >
          <View className="mb-6">
            <SheetHeader
              title="Filter Tasks"
              subtitle="Refine your task list"
              onClose={() => sheetRef.current?.dismiss()}
            />
          </View>

          <FilterSection title="Date">
            <View
              accessibilityRole="radiogroup"
              className="-ml-1 mb-1 flex-row flex-wrap gap-1"
            >
              {DATE_PRESETS.map((chip) => (
                <DatePreset
                  key={chip.key}
                  label={chip.label}
                  active={!hasCustomDate && draft.datePreset === chip.key}
                  onPress={() => selectDatePreset(chip.key)}
                />
              ))}
            </View>

            <View className="mt-3">
              <DateRangeField
                fromLabel={formatDisplayDate(draft.dateFrom)}
                toLabel={formatDisplayDate(draft.dateTo)}
                fromSet={Boolean(draft.dateFrom)}
                toSet={Boolean(draft.dateTo)}
                onPressFrom={() => openDatePicker("from")}
                onPressTo={() => openDatePicker("to")}
              />
            </View>
          </FilterSection>

          <FilterActions onClear={handleReset} onApply={handleApply} />
        </BottomSheetScrollView>
      </BottomSheetModal>

      <CalendarPickerModal
        visible={pickerTarget !== null}
        title={pickerTarget === "to" ? "End date" : "Start date"}
        selectedDate={selectedDate}
        onSelect={onPickDate}
        onClose={() => setPickerTarget(null)}
      />
    </>
  );
});
