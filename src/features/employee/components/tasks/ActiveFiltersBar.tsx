import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/styles";
import type { ActiveFilterChip } from "@/features/employee/utils/taskFilters";

type ActiveFiltersBarProps = {
  chips: ActiveFilterChip[];
  onRemoveChip: (chipId: ActiveFilterChip["id"]) => void;
  onClearAll: () => void;
};

/** RN styles need rgba, not a hex+alpha helper — tints the primary accent for each removable chip. */
const CHIP_TINT = "rgba(37, 99, 235, 0.08)";

export function ActiveFiltersBar({
  chips,
  onRemoveChip,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (chips.length === 0) return null;

  return (
    <View
      className="flex-row items-center border-b bg-white px-4 py-2"
      style={{ borderColor: colors.border }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, alignItems: "center", paddingRight: 12 }}
        className="flex-1"
      >
        {chips.map((chip) => (
          <Pressable
            key={chip.id}
            onPress={() => onRemoveChip(chip.id)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label} filter`}
            className="flex-row items-center rounded-full px-3 py-1.5"
            style={{ backgroundColor: CHIP_TINT }}
          >
            <Text className="text-[12px] font-semibold" style={{ color: colors.primary }}>
              {chip.label}
            </Text>
            <Ionicons
              name="close"
              size={13}
              color={colors.primary}
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={onClearAll}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Clear all filters"
      >
        <Text className="text-[13px] font-semibold" style={{ color: colors.textMuted }}>
          Clear all
        </Text>
      </Pressable>
    </View>
  );
}
