import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import {
  formatDate,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

export type TaskDetailBottomSheetRef = {
  present: (task: Task) => void;
  dismiss: () => void;
};

export const TaskDetailBottomSheet = forwardRef<TaskDetailBottomSheetRef>(
  function TaskDetailBottomSheet(_, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const [task, setTask] = useState<Task | null>(null);

    const snapPoints = useMemo(() => ["48%"], []);

    useImperativeHandle(ref, () => ({
      present: (next: Task) => {
        setTask(next);
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useSheetBackdrop();

    const statusColor = task ? getStatusColor(task.status) : "#6B7280";
    const priorityColor = task ? getPriorityColor(task.priority) : "#6B7280";

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
          {task ? (
            <>
              <SheetHeader title={task.title} />
              <Text className="-mt-3 text-[14px] leading-5 text-[#6B7280]">
                {task.description}
              </Text>

              <View className="mt-5 gap-3">
                <DetailRow
                  icon="calendar-outline"
                  label="Date"
                  value={formatDate(task.dueDate)}
                />
                {task.time ? (
                  <DetailRow
                    icon="time-outline"
                    label="Time"
                    value={task.time}
                  />
                ) : null}
                <DetailRow
                  icon="flag-outline"
                  label="Status"
                  value={getStatusLabel(task.status)}
                  color={statusColor}
                />
                <DetailRow
                  icon="flash-outline"
                  label="Priority"
                  value={getPriorityLabel(task.priority)}
                  color={priorityColor}
                />
              </View>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

function DetailRow({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="flex-row items-center rounded-2xl bg-[#F3F4F6] px-4 py-3">
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-white">
        <Ionicons name={icon} size={18} color={color ?? "#111827"} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] text-[#9CA3AF]">{label}</Text>
        <Text
          className="mt-0.5 text-[14px] font-semibold"
          style={{ color: color ?? "#111827" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
