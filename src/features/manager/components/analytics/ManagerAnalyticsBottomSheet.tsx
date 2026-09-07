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
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { ManagerAnalyticsHeader } from "@/features/manager/components/analytics/ManagerAnalyticsHeader";
import { ManagerAnalyticsSection } from "@/features/manager/components/analytics/ManagerAnalyticsSection";
import { useManagerAssignedKpi } from "@/features/tasks/hooks/useTasks";

export type ManagerAnalyticsBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ManagerAnalyticsBottomSheetProps = {
  onSeeAllPerformers?: () => void;
};

export const ManagerAnalyticsBottomSheet = forwardRef<
  ManagerAnalyticsBottomSheetRef,
  ManagerAnalyticsBottomSheetProps
>(function ManagerAnalyticsBottomSheet({ onSeeAllPerformers }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["90%"], []);
  const renderBackdrop = useSheetBackdrop();
  const { data: assignedKpi, isLoading, isError } = useManagerAssignedKpi();

  const completionRate =
    assignedKpi && assignedKpi.totalTasks > 0
      ? Math.round((assignedKpi.doneTasks / assignedKpi.totalTasks) * 1000) / 10
      : 0;

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <View className="border-b border-[#F3F4F6] px-5 pb-3">
        <ManagerAnalyticsHeader
          completionRate={completionRate}
          pendingTasks={assignedKpi?.pendingTasks}
          hasData={Boolean(assignedKpi)}
          onSeeAll={onSeeAllPerformers}
        />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <ManagerAnalyticsSection
          assignedKpi={assignedKpi}
          isLoading={isLoading}
          isError={isError}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
