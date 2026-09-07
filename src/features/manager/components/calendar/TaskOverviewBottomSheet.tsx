import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Calendar, ChevronRight } from "lucide-react-native";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import {
  PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  getTaskColor,
} from "@/features/manager/data/calendarTasks";
import type { TaskResponse } from "@/features/tasks/types/task.types";

export type TaskOverviewBottomSheetRef = {
  present: (task: TaskResponse) => void;
  dismiss: () => void;
};

type TaskOverviewBottomSheetProps = {
  onViewFullDetails: (task: TaskResponse) => void;
};

function InitialsAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
      <Text className="text-[13px] font-bold text-[#6B7280]">{initial}</Text>
    </View>
  );
}

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

  const color = task ? getTaskColor(task) : "#32CD32";

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
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
        >
          <View className="mb-2">
            <SheetHeader
              title={task.title}
              onClose={() => sheetRef.current?.dismiss()}
            />
            <View className="-mt-2 flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-[12px] font-semibold" style={{ color }}>
                {TASK_STATUS_LABELS[task.status]}
              </Text>
            </View>
          </View>

          {task.description ? (
            <Text className="mb-4 text-[13px] leading-5 text-[#6B7280]">
              {task.description}
            </Text>
          ) : null}

          <View className="flex-row items-center gap-3 rounded-2xl bg-[#F9FAFB] p-3.5">
            {task.assignee?.avatarUrl ? (
              <Image
                source={{ uri: task.assignee.avatarUrl }}
                className="h-9 w-9 rounded-full bg-[#E5E7EB]"
              />
            ) : (
              <InitialsAvatar name={task.assignee?.name ?? "?"} />
            )}
            <View className="min-w-0 flex-1">
              <Text className="text-[12px] text-[#9CA3AF]">Assignee</Text>
              <Text className="text-[13px] font-semibold text-[#111827]" numberOfLines={1}>
                {task.assignee?.name ?? "Unassigned"}
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-3 rounded-2xl bg-[#F9FAFB] p-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Calendar size={16} color="#6B7280" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[12px] text-[#9CA3AF]">Due date</Text>
              <Text className="text-[13px] font-semibold text-[#111827]">
                {task.dueDate ?? "—"}
              </Text>
            </View>
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${PRIORITY_COLORS[task.priority]}18` }}
            >
              <Text
                className="text-[10px] font-bold uppercase"
                style={{ color: PRIORITY_COLORS[task.priority] }}
              >
                {task.priority}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              sheetRef.current?.dismiss();
              onViewFullDetails(task);
            }}
            accessibilityRole="button"
            className="mt-5 flex-row items-center justify-center gap-1.5 rounded-2xl bg-[#111827] py-3.5"
          >
            <Text className="text-[14px] font-semibold text-white">View Full Details</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </Pressable>
        </BottomSheetScrollView>
      ) : null}
    </BottomSheetModal>
  );
});
