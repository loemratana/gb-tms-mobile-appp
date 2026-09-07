import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { CARD_SHADOW } from "@/features/employee/components/task/cardStyles";
import type { Task, TaskActivity } from "@/features/employee/types/types";

type ActivityTimelineProps = {
  task: Task;
};

const META: Record<
  TaskActivity["type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  created: { icon: "add-circle", color: "#6B7280", bg: "#F3F4F6" },
  status: { icon: "swap-horizontal", color: "#2563EB", bg: "#EFF6FF" },
  comment: { icon: "chatbubble-ellipses", color: "#D97706", bg: "#FFFBEB" },
  assigned: { icon: "person-add", color: "#32CD32", bg: "#ECFDF5" },
  work_update: { icon: "create", color: "#7C3AED", bg: "#F5F3FF" },
};

export function ActivityTimeline({ task }: ActivityTimelineProps) {
  const items = task.activities ?? [];

  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Activity
      </Text>

      <View
        className="rounded-3xl border border-[#E5E7EB] bg-white px-4 py-2"
        style={CARD_SHADOW}
      >
        {items.length === 0 ? (
          <Text className="py-4 text-center text-[13px] text-[#9CA3AF]">
            No activity yet
          </Text>
        ) : (
          <View className="relative">
            {items.length > 1 ? (
              <View
                className="absolute rounded-full bg-[#E5E7EB]"
                style={{ left: 17, top: 32, bottom: 32, width: 2 }}
              />
            ) : null}

            {items.map((item) => {
              const meta = META[item.type];
              return (
                <View key={item.id} className="flex-row items-start py-3.5">
                  <View
                    className="mr-3 h-9 w-9 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-[14px] font-semibold text-[#111827]">
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-[12px] text-[#9CA3AF]">
                      {item.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
