import { Pressable, Text, View } from "react-native";
import { palette } from "@/styles";

export type SegmentOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Single-select switch between 2–4 views (e.g. Schedule / Month, Today / Upcoming / Done). */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-subtle p-1" accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`h-9 flex-1 items-center justify-center rounded-lg ${isActive ? "bg-surface" : ""}`}
            style={
              isActive
                ? { shadowColor: palette.slate[900], shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 }
                : undefined
            }
          >
            <Text className={`text-body-sm ${isActive ? "font-semibold text-fg" : "font-medium text-fg-soft"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
