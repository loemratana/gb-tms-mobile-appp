import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { PRIORITY_OPTIONS } from "@/features/tasks/utils/priorityOptions";
import type { Priority } from "@/features/tasks/types/task.types";
import { colors } from "@/styles";

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
              selected ? "border-brand" : "border-line"
            }`}
          >
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selected ? colors.brand : colors.textSubtle}
            />
            <Text
              className={`text-body-sm font-semibold ${
                selected ? "text-brand-strong" : "text-fg-sub"
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
