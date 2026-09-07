import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import type { ActivityItem } from "@/features/employee/data/profile";

type RecentActivityProps = {
  items: ActivityItem[];
};

const ACTIVITY_META: Record<
  ActivityItem["type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  completed: {
    icon: "checkmark-circle",
    color: "#059669",
    bg: "#E9F8F2",
  },
  commented: {
    icon: "chatbubble-ellipses",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  updated: {
    icon: "create",
    color: "#D97706",
    bg: "#FFF6E8",
  },
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Recent Activity
      </Text>

      <View
        className="rounded-3xl bg-white px-4 py-2"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        {items.map((item, index) => {
          const meta = ACTIVITY_META[item.type];

          return (
            <View
              key={item.id}
              className={`flex-row items-start py-3.5 ${
                index < items.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: meta.color }}
              >
                <Ionicons name={meta.icon} size={18} color="#FFFFFF" />
              </View>

              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-[#111827]">
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-[13px] text-[#6B7280]">
                  {item.subtitle}
                </Text>
              </View>

              <Text className="ml-2 text-[11px] text-[#9CA3AF]">{item.time}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
