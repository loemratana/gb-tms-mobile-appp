import { Pressable, ScrollView, Text, View } from "react-native";

import type { ListStatusFilter } from "@/features/employee/components/tasks/TaskFilterChips";

export type StatusFilter = ListStatusFilter;

const CHIPS: { key: StatusFilter; label: string; color: string }[] = [
  { key: "all", label: "All Tasks", color: "#2563EB" },
  { key: "in_progress", label: "In Progress", color: "#2563EB" },
  { key: "pending", label: "Pending", color: "#D97706" },
  { key: "done", label: "Done", color: "#16A34A" },
  { key: "cancelled", label: "Cancelled", color: "#DC2626" },
];

/** RN styles need rgba, not a hex+alpha helper — tints each chip's accent to a soft selected background. */
function tint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type StatusFilterChipsProps = {
  active: StatusFilter;
  onChange: (status: StatusFilter) => void;
};

export function StatusFilterChips({
  active,
  onChange,
}: StatusFilterChipsProps) {
  return (
    <View className="py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CHIPS.map((chip) => {
          const isActive = active === chip.key;

          return (
            <Pressable
              key={chip.key}
              onPress={() => onChange(chip.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className="h-9 flex-row items-center gap-1.5 rounded-full border px-3.5"
              style={{
                backgroundColor: isActive ? tint(chip.color, 0.1) : "#FFFFFF",
                borderColor: isActive ? tint(chip.color, 0.35) : "#E5E7EB",
              }}
            >
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: chip.color }}
              />
              <Text
                className="text-[12.5px] font-semibold"
                style={{ color: isActive ? chip.color : "#6B7280" }}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
