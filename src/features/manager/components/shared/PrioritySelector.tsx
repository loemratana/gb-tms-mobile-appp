import { Pressable, Text, View } from "react-native";

import type { ProjectPriority } from "@/features/manager/types/project";

const OPTIONS: { key: ProjectPriority; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

type PrioritySelectorProps = {
  value: ProjectPriority;
  onChange: (value: ProjectPriority) => void;
};

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((option) => {
        const selected = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`h-11 flex-1 items-center justify-center rounded-xl border ${
              selected
                ? "border-[#32CD32] bg-[#F0FDF4]"
                : "border-[#E5E7EB] bg-[#F9FAFB]"
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected ? "text-[#16A34A]" : "text-[#6B7280]"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
