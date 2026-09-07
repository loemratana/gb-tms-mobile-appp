import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import {
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from "@/features/employee/helpers/helpers";
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  EMPTY_FILTERS,
  type CalendarFilters,
} from "@/features/employee/utils/calendarFilters";

export type CalendarFilterBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type CalendarFilterBottomSheetProps = {
  filters: CalendarFilters;
  onApply: (filters: CalendarFilters) => void;
};

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

export const CalendarFilterBottomSheet = forwardRef<
  CalendarFilterBottomSheetRef,
  CalendarFilterBottomSheetProps
>(function CalendarFilterBottomSheet({ filters, onApply }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<CalendarFilters>(filters);

  const snapPoints = useMemo(() => ["58%"], []);

  useImperativeHandle(ref, () => ({
    present: () => {
      setDraft(filters);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
  };

  const handleApply = () => {
    onApply(draft);
    sheetRef.current?.dismiss();
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
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <View className="mb-2">
          <SheetHeader
            title="Filter Calendar"
            subtitle="Filter tasks by status and priority"
            align="center"
          />
        </View>

        <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
          Status
        </Text>
        <View className="mb-5 flex-row flex-wrap gap-2">
          {ALL_STATUSES.map((status) => {
            const active = draft.statuses.includes(status);
            const color = getStatusColor(status);
            return (
              <Pressable
                key={status}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    statuses: toggleItem(prev.statuses, status),
                  }))
                }
                className="rounded-full border px-3.5 py-2"
                style={{
                  borderColor: active ? color : "#E5E7EB",
                  backgroundColor: active ? `${color}18` : "#F9FAFB",
                }}
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: active ? color : "#6B7280" }}
                >
                  {getStatusLabel(status)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
          Priority
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {ALL_PRIORITIES.map((priority) => {
            const active = draft.priorities.includes(priority);
            const color = getPriorityColor(priority);
            return (
              <Pressable
                key={priority}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    priorities: toggleItem(prev.priorities, priority),
                  }))
                }
                className="rounded-full border px-3.5 py-2"
                style={{
                  borderColor: active ? color : "#E5E7EB",
                  backgroundColor: active ? `${color}18` : "#F9FAFB",
                }}
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: active ? color : "#6B7280" }}
                >
                  {getPriorityLabel(priority)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleReset}
            className="flex-1 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-4"
          >
            <Text className="text-[15px] font-semibold text-[#374151]">
              Reset
            </Text>
          </Pressable>

          <Pressable
            onPress={handleApply}
            className="flex-1 items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: "#32CD32" }}
          >
            <Text className="text-[15px] font-semibold text-white">
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
