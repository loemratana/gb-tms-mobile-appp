import {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { colors } from "@/styles";

export type ManagerTaskActionsSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ManagerTaskActionsSheetProps = {
  onReassign: () => void;
  onChangePriority: () => void;
  /** False for a group task: people are added through member subtasks, so the server refuses reassigning it. */
  canReassign?: boolean;
  /** Shown only when provided and canDelete is true. */
  onDelete?: () => void;
  canDelete?: boolean;
};

type ActionKey =
  | "reassign"
  | "change_priority"
  | "delete";

const ACTIONS: {
  key: ActionKey;
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
}[] = [
  {
    key: "reassign",
    title: "Reassign Task",
    icon: "person-add-outline",
    color: colors.brand,
  },
  {
    key: "change_priority",
    title: "Change Priority",
    icon: "flag-outline",
    color: colors.warning,
  },
  {
    key: "delete",
    title: "Delete Task",
    icon: "trash-outline",
    color: colors.danger,
  },
];

export const ManagerTaskActionsSheet = forwardRef<
  ManagerTaskActionsSheetRef,
  ManagerTaskActionsSheetProps
>(function ManagerTaskActionsSheet(
  {
    onReassign,
    onChangePriority,
    canReassign = true,
    onDelete,
    canDelete = false,
  },
  ref,
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const pendingActionRef = useRef<ActionKey | null>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => [canDelete ? "50%" : "42%"], [canDelete]);

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

    if (key === "reassign") onReassign();
    if (key === "change_priority") onChangePriority();
    if (key === "delete") onDelete?.();
  }, [onReassign, onChangePriority, onDelete]);

  const handleAction = (key: ActionKey) => {
    pendingActionRef.current = key;
    sheetRef.current?.dismiss();
  };

  const visibleActions = ACTIONS.filter((action) => {
    if (action.key === "reassign") return canReassign;
    if (action.key === "delete") return canDelete && Boolean(onDelete);
    return true;
  });

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

        <View className="overflow-hidden rounded-2xl border border-line bg-surface">
          {visibleActions.map((action, index) => {
            const isLast = index === visibleActions.length - 1;

            return (
              <Pressable
                key={action.key}
                onPress={() => handleAction(action.key)}
                accessibilityRole="button"
                accessibilityLabel={action.title}
                className={`flex-row items-center px-3.5 py-3.5 ${
                  isLast ? "" : "border-b border-line-soft"
                }`}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: action.color }}
                >
                  <Ionicons name={action.icon} size={18} color={colors.textInverse} />
                </View>

                <Text className="flex-1 text-body font-semibold text-fg">
                  {action.title}
                </Text>

                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className="mt-3 items-center rounded-2xl bg-subtle py-3.5"
        >
          <Text className="text-body font-semibold text-fg-sub">Cancel</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
