import { UserRoundCog } from "lucide-react-native";
import { Image, Platform, Pressable, Text, View } from "react-native";

import type { Task } from "@/features/employee/types/types";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 3 },
});

type EmployeeInfoCardProps = {
  task: Task;
  isOnline?: boolean;
  onReassign?: () => void;
};

export function EmployeeInfoCard({
  task,
  isOnline = false,
  onReassign,
}: EmployeeInfoCardProps) {
  const assignee = task.assignees[0];

  return (
    <View
      className="rounded-3xl border border-[#F3F4F6] bg-white p-4"
      style={CARD_SHADOW}
    >
      <View className="flex-row items-center">
        <View className="relative">
          {assignee?.avatarUrl ? (
            <Image
              source={{ uri: assignee.avatarUrl }}
              className="h-14 w-14 rounded-2xl bg-[#E5E7EB]"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#E5E7EB]">
              <Text className="text-[18px] font-bold text-[#6B7280]">
                {assignee?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: isOnline ? "#32CD32" : "#9CA3AF" }}
          />
        </View>

        <View className="ml-3 min-w-0 flex-1">
          <Text className="text-[16px] font-bold text-[#111827]" numberOfLines={1}>
            {assignee?.name ?? "Unassigned"}
          </Text>
          <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={1}>
            {assignee?.role ?? "Team member"}
          </Text>
          <Text className="mt-0.5 text-[12px] text-[#9CA3AF]" numberOfLines={1}>
            {assignee?.department ?? task.team ?? "Department"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onReassign}
        accessibilityRole="button"
        accessibilityLabel="Reassign task"
        className="mt-4 flex-row items-center justify-center gap-2 rounded-full bg-[#F9FAFB] py-2.5"
      >
        <UserRoundCog size={16} color="#32CD32" strokeWidth={2.2} />
        <Text className="text-[13px] font-semibold text-[#32CD32]">Reassign Task</Text>
      </Pressable>
    </View>
  );
}
