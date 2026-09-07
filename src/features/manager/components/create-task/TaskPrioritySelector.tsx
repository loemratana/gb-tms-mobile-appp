import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { PRIORITY_OPTIONS } from "@/features/manager/components/create-task/taskFormSchema";
import type { Priority } from "@/features/tasks/types/task.types";

type TaskPrioritySelectorProps = {
  value: Priority;
  onChange: (value: Priority) => void;
};

export function TaskPrioritySelector({ value, onChange }: TaskPrioritySelectorProps) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {PRIORITY_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={`h-10 flex-row items-center gap-2 rounded-full border px-3 ${
              selected ? "border-[#32CD32]" : "border-[#E5E7EB]"
            }`}
          >
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selected ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[14px] font-semibold ${
                selected ? "text-[#16A34A]" : "text-[#374151]"
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
