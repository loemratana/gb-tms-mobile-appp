import { Bell, ChevronLeft, MoreHorizontal } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TaskStatus } from "@/features/employee/types/types";
import { StatusBadge } from "@/features/manager/components/task/StatusBadge";

type TaskDetailHeaderProps = {
  title: string;
  status: TaskStatus;
  onBack?: () => void;
  onMore?: () => void;
  onReminder?: () => void;
};

export function TaskDetailHeader({
  title,
  status,
  onBack,
  onMore,
  onReminder,
}: TaskDetailHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center gap-2 px-4 py-2">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]"
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </Pressable>

        <Text
          className="min-w-0 flex-1 text-[16px] font-bold text-[#111827]"
          numberOfLines={1}
        >
          {title}
        </Text>

        <StatusBadge status={status} />

        {onReminder ? (
          <Pressable
            onPress={onReminder}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Reminder settings"
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Bell size={19} color="#111827" strokeWidth={2.2} />
          </Pressable>
        ) : null}

        {onMore ? (
          <Pressable
            onPress={onMore}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="More actions"
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <MoreHorizontal size={20} color="#111827" strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
