import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Pressable, Text, View } from "react-native";

import type { NotificationFilter } from "@/features/employee/types/notification";

const TABS: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "comments", label: "Comments" },
  { key: "updates", label: "Updates" },
];

type FilterTabsProps = {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
};

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <View className="border-b border-[#E5E7EB] bg-white pb-2 pt-2">
      <BottomSheetScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: isActive ? "#111827" : "#F3F4F6",
                borderWidth: isActive ? 0 : 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: isActive ? "#FFFFFF" : "#6B7280" }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </View>
  );
}
