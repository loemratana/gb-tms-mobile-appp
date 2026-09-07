import Ionicons from "@expo/vector-icons/Ionicons";
import { Bell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getStatusColor,
  getStatusLabel,
} from "@/features/employee/helpers/helpers";
import type { TaskStatus } from "@/features/employee/types/types";

type TaskDetailHeaderProps = {
  title: string;
  status: TaskStatus;
  onBack?: () => void;
  onReminder?: () => void;
};

export function TaskDetailHeader({
  title,
  status,
  onBack,
  onReminder,
}: TaskDetailHeaderProps) {
  const statusColor = getStatusColor(status);

  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text
          className="min-w-0 flex-1 text-[16px] font-bold text-[#111827]"
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor }} />
          <Text
            className="text-[12px] font-bold tracking-wide"
            style={{ color: statusColor }}
          >
            {getStatusLabel(status)}
          </Text>
        </View>

        {onReminder ? (
          <Pressable
            onPress={onReminder}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Reminder settings"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Bell size={19} color="#111827" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
