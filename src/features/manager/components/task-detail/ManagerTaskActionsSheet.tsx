import {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import {
  ChevronRight,
  Eye,
  Flag,
  RefreshCw,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react-native";
import {
  forwardRef,
  useCallback,
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

export type ManagerTaskActionsSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ManagerTaskActionsSheetProps = {
  onRequestUpdate: () => void;
  onReassign: () => void;
  onChangePriority: () => void;
  onMarkReview: () => void;
  canMarkReview?: boolean;
};

type ActionKey =
  | "request_update"
  | "reassign"
  | "change_priority"
  | "mark_review";

const ACTIONS: {
  key: ActionKey;
  title: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    key: "request_update",
    title: "Request Update",
    icon: RefreshCw,
    color: "#16A34A",
  },
  {
    key: "reassign",
    title: "Reassign Task",
    icon: UserRoundCog,
    color: "#2563EB",
  },
  {
    key: "change_priority",
    title: "Change Priority",
    icon: Flag,
    color: "#D97706",
  },
  {
    key: "mark_review",
    title: "Mark for Review",
    icon: Eye,
    color: "#7C3AED",
  },
];

export const ManagerTaskActionsSheet = forwardRef<
  ManagerTaskActionsSheetRef,
  ManagerTaskActionsSheetProps
>(function ManagerTaskActionsSheet(
  {
    onRequestUpdate,
    onReassign,
    onChangePriority,
    onMarkReview,
    canMarkReview = true,
  },
  ref,
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const pendingActionRef = useRef<ActionKey | null>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["42%"], []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    stiffness: 520,
    mass: 0.28,
    overshootClamping: true,
  });

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const runPendingAction = useCallback(() => {
    const key = pendingActionRef.current;
    pendingActionRef.current = null;
    if (!key) return;

    if (key === "request_update") onRequestUpdate();
    if (key === "reassign") onReassign();
    if (key === "change_priority") onChangePriority();
    if (key === "mark_review") onMarkReview();
  }, [onRequestUpdate, onReassign, onChangePriority, onMarkReview]);

  const handleAction = (key: ActionKey) => {
    pendingActionRef.current = key;
    sheetRef.current?.dismiss();
  };

  const visibleActions = ACTIONS.filter(
    (action) => action.key !== "mark_review" || canMarkReview,
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      animateOnMount
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      onDismiss={runPendingAction}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom + 12, 24),
        }}
      >
        <SheetHeader
          title="Task Actions"
          subtitle="Manage this task"
          onClose={() => sheetRef.current?.dismiss()}
        />

        <View className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            const isLast = index === visibleActions.length - 1;

            return (
              <Pressable
                key={action.key}
                onPress={() => handleAction(action.key)}
                accessibilityRole="button"
                accessibilityLabel={action.title}
                className={`flex-row items-center px-3.5 py-3.5 ${
                  isLast ? "" : "border-b border-[#F3F4F6]"
                }`}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: action.color }}
                >
                  <Icon size={18} color="#FFFFFF" strokeWidth={2.3} />
                </View>

                <Text className="flex-1 text-[15px] font-semibold text-[#111827]">
                  {action.title}
                </Text>

                <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.2} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className="mt-3 items-center rounded-2xl bg-[#F3F4F6] py-3.5"
        >
          <Text className="text-[15px] font-semibold text-[#374151]">Cancel</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
