import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { TaskStatus } from "@/features/employee/types/types";

type TaskDetailActionBarProps = {
  status: TaskStatus;
  isAssignee: boolean;
  bottomInset: number;
  onSubmitWork: () => void;
};

const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 8,
};

export function TaskDetailActionBar({
  status,
  isAssignee,
  bottomInset,
  onSubmitWork,
}: TaskDetailActionBarProps) {
  const isClosed = status === "done" || status === "cancelled";

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white px-4 pt-3"
      style={[SHADOW, { paddingBottom: Math.max(bottomInset, 12) }]}
    >
      {isClosed ? (
        <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] py-3.5">
          <Ionicons
            name={status === "done" ? "checkmark-circle" : "close-circle"}
            size={18}
            color={status === "done" ? "#32CD32" : "#EF4444"}
          />
          <Text className="text-[14px] font-semibold text-[#374151]">
            {status === "done" ? "Task completed" : "Task cancelled"}
          </Text>
        </View>
      ) : !isAssignee ? (
        <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#F3F4F6] py-3.5">
          <Ionicons name="eye-outline" size={18} color="#6B7280" />
          <Text className="text-[14px] font-semibold text-[#374151]">
            You&apos;re not assigned to this task
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={onSubmitWork}
          accessibilityRole="button"
          accessibilityLabel="Submit work"
          className="flex-row items-center justify-center rounded-2xl bg-[#32CD32] py-3.5"
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
          <Text className="ml-2 text-[14px] font-bold text-white">
            Submit Work
          </Text>
        </Pressable>
      )}
    </View>
  );
}
