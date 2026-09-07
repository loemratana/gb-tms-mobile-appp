import { Pressable, ScrollView, Text, View } from "react-native";

import type { TaskCategory } from "@/features/employee/types/types";

export type CategoryFilter = "all" | TaskCategory;

const CHIPS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "personal", label: "Personal" },
  { key: "design", label: "Design" },
  { key: "meeting", label: "Meeting" },
  { key: "development", label: "Development" },
];

type CategoryChipsProps = {
  active: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
};

export function CategoryChips({ active, onChange }: CategoryChipsProps) {
  return (
    <View className="mt-4">
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
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: isActive ? "#2563EB" : "#FFFFFF",
                borderWidth: 1,
                borderColor: isActive ? "#2563EB" : "#E5E7EB",
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: isActive ? "#FFFFFF" : "#6B7280" }}
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
