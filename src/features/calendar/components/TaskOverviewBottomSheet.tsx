import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { parseDateKey } from "@/features/calendar/utils/calendarDates";
import {
  TASK_STATUS_LABELS,
  getTaskTone,
  isTaskOverdue,
} from "@/features/calendar/utils/calendarTasks";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { colors, priorityTone } from "@/styles";

export type TaskOverviewBottomSheetRef = {
  present: (task: TaskResponse) => void;
  dismiss: () => void;
};

type TaskOverviewBottomSheetProps = {
  onViewFullDetails: (task: TaskResponse) => void;
};

function priorityLabel(priority: TaskResponse["priority"]): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "No due date";
  return parseDateKey(dueDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Quick look at a calendar task: status, priority, assignee, due date, then a link to the full detail. */
export const TaskOverviewBottomSheet = forwardRef<
  TaskOverviewBottomSheetRef,
  TaskOverviewBottomSheetProps
>(function TaskOverviewBottomSheet({ onViewFullDetails }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["50%"], []);
  const [task, setTask] = useState<TaskResponse | null>(null);

  useImperativeHandle(ref, () => ({
    present: (nextTask) => {
      setTask(nextTask);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();
  const isOverdue = task ? isTaskOverdue(task) : false;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      {task ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
        >
          <SheetHeader title={task.title} onClose={() => sheetRef.current?.dismiss()} />

          <View className="-mt-2 mb-4 flex-row flex-wrap items-center gap-1.5">
            <Badge label={isOverdue ? "Overdue" : TASK_STATUS_LABELS[task.status]} tone={getTaskTone(task)} hasDot />
            <Badge label={`${priorityLabel(task.priority)} priority`} tone={priorityTone[task.priority]} icon="flag" />
          </View>

          {task.description ? (
            <Text className="mb-4 text-body-sm text-fg-sub">{task.description}</Text>
          ) : null}

          <View className="rounded-xl border border-line px-4">
            <View className="flex-row items-center gap-3 py-3">
              {task.assignee ? (
                <Avatar name={task.assignee.name} imageUrl={task.assignee.avatarUrl} size={36} />
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-subtle">
                  <Ionicons name="person-outline" size={16} color={colors.textSubtle} />
                </View>
              )}
              <View className="min-w-0 flex-1">
                <Text className="text-label text-fg-faint">Assignee</Text>
                <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
                  {task.assignee?.name ?? "Unassigned"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 border-t border-line-soft py-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-subtle">
                <Ionicons name="calendar-outline" size={16} color={isOverdue ? colors.danger : colors.textMuted} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-label text-fg-faint">Due date</Text>
                <Text className={`text-body-sm font-semibold ${isOverdue ? "text-error" : "text-fg"}`}>
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5">
            <Button
              label="View full details"
              icon="arrow-forward"
              onPress={() => {
                sheetRef.current?.dismiss();
                onViewFullDetails(task);
              }}
            />
          </View>
        </BottomSheetScrollView>
      ) : null}
    </BottomSheetModal>
  );
});
