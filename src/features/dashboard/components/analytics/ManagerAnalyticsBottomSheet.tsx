import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExpandableSheetBackground,
  ExpandableSheetHandle,
  ExpandableSheetHeader,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { useManagerAssignedKpi } from "@/features/tasks/hooks/useTasks";

import { AnalyticsKpiGrid } from "./AnalyticsKpiGrid";
import { ManagerAnalyticsHeader } from "./ManagerAnalyticsHeader";
import { ManagerAnalyticsSection } from "./ManagerAnalyticsSection";

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
  // Opens at 90%; scrolling or dragging up expands it to full screen (like the New task sheet).
  const snapPoints = useMemo(() => ["90%", "100%"], []);
  const renderBackdrop = useSheetBackdrop();
  const { data: assignedKpi, isLoading, isError, refetch } = useManagerAssignedKpi();
  const hasPerformers = (assignedKpi?.topPerformers.length ?? 0) > 0;

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture
      backdropComponent={renderBackdrop}
      backgroundComponent={ExpandableSheetBackground}
      handleComponent={ExpandableSheetHandle}
    >
      {/* The content paints the sheet colour itself, like the New task sheet: the expandable
          background alone left the sheet see-through. */}
      <View className="flex-1 bg-surface">
        <ExpandableSheetHeader topInset={insets.top}>
          <View className="px-5 pb-4 pt-1">
            <ManagerAnalyticsHeader onSeeTopPerformers={hasPerformers ? onSeeAllPerformers : undefined} />
          </View>
        </ExpandableSheetHeader>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
          }}
        >
          {/* The headline numbers first, then the charts behind them. */}
          {assignedKpi && assignedKpi.totalTasks > 0 ? (
            <View className="mb-7">
              <AnalyticsKpiGrid kpi={assignedKpi} />
            </View>
          ) : null}
          <ManagerAnalyticsSection
            assignedKpi={assignedKpi}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});
