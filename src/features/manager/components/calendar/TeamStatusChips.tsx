import { Image, ScrollView, Text, View } from "react-native";

import {
  teamQuickStatuses,
  type TeamQuickStatus,
} from "@/features/manager/data/timeline";

const STATUS_CONFIG: Record<
  TeamQuickStatus["status"],
  { label: string; dot: string }
> = {
  available: { label: "Available", dot: "#32CD32" },
  busy: { label: "Busy", dot: "#F59E0B" },
  overloaded: { label: "Overloaded", dot: "#EF4444" },
};

export function TeamStatusChips() {
  return (
    <View>
      <Text className="mb-2 text-[11px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Team availability
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {teamQuickStatuses.map((member) => {
          const config = STATUS_CONFIG[member.status];
          const firstName = member.name.split(" ")[0];

          return (
            <View
              key={member.id}
              className="flex-row items-center gap-2 rounded-full border border-[#F3F4F6] bg-white px-3 py-2"
            >
              <View className="relative">
                <Image
                  source={{ uri: member.avatarUrl }}
                  className="h-7 w-7 rounded-full bg-[#F3F4F6]"
                />
                <View
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: config.dot }}
                />
              </View>
              <Text className="text-[12px] font-semibold text-[#111827]">
                {firstName}
              </Text>
              <Text className="text-[11px] text-[#6B7280]">{config.label}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
