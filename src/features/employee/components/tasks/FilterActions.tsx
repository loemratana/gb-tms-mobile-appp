import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

type FilterActionsProps = {
  onClear: () => void;
  onApply: () => void;
};

/** "Clear all" stays a plain text action; "Apply Filters" is the one solid, primary button on the sheet. */
export function FilterActions({ onClear, onApply }: FilterActionsProps) {
  return (
    <View className="flex-row items-center justify-between pt-1">
      <Pressable
        onPress={onClear}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Clear all filters"
      >
        <Text className="text-[15px] font-semibold" style={{ color: colors.textMuted }}>
          Clear all
        </Text>
      </Pressable>

      <Pressable
        onPress={onApply}
        accessibilityRole="button"
        accessibilityLabel="Apply filters"
        className="rounded-full px-8 py-3.5"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-[15px] font-semibold text-white">Apply Filters</Text>
      </Pressable>
    </View>
  );
}
