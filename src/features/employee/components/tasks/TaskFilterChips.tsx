import { Pressable, ScrollView, Text, View } from "react-native";

import type { TaskCategory } from "@/features/employee/types/types";

export type CategoryFilter = "all" | TaskCategory;
export type ListStatusFilter =
  | "all"
  | "in_progress"
  | "pending"
  | "done"
  | "cancelled";

const CATEGORY_CHIPS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "design", label: "Design" },
  { key: "meeting", label: "Meeting" },
  { key: "development", label: "Development" },
];

const STATUS_CHIPS: { key: ListStatusFilter; label: string; color: string }[] =
  [
    { key: "all", label: "All", color: "#32CD32" },
    { key: "in_progress", label: "In Progress", color: "#2563EB" },
    { key: "pending", label: "Pending", color: "#6B7280" },
    { key: "done", label: "Done", color: "#22C55E" },
    { key: "cancelled", label: "Cancelled", color: "#EF4444" },
  ];

type TaskFilterChipsProps = {
  category: CategoryFilter;
  status: ListStatusFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onStatusChange: (status: ListStatusFilter) => void;
};

function ChipRow<T extends string>({
  chips,
  active,
  onChange,
}: {
  chips: { key: T; label: string; color?: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {chips.map((chip) => {
        const isActive = active === chip.key;
        const accent = chip.color ?? "#2563EB";

        return (
          <Pressable
            key={chip.key}
            onPress={() => onChange(chip.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className="rounded-full px-3.5 py-2"
            style={{
              backgroundColor: isActive ? accent : "#FFFFFF",
              borderWidth: 1,
              borderColor: isActive ? accent : "#E5E7EB",
            }}
          >
            <Text
              className="text-[12px] font-semibold"
              style={{ color: isActive ? "#FFFFFF" : "#6B7280" }}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function TaskFilterChips({
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: TaskFilterChipsProps) {
  return (
    <View className="gap-2.5">
      <ChipRow
        chips={CATEGORY_CHIPS}
        active={category}
        onChange={onCategoryChange}
      />
      <ChipRow
        chips={STATUS_CHIPS}
        active={status}
        onChange={onStatusChange}
      />
    </View>
  );
}
