import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { ActiveFilterChip } from "@/features/tasks/utils/taskFilters";
import { colors, withAlpha } from "@/styles";

type ActiveFiltersBarProps = {
  chips: ActiveFilterChip[];
  onRemoveChip: (chipId: ActiveFilterChip["id"]) => void;
  onClearAll: () => void;
};

/** RN styles need rgba, not a hex+alpha helper — tints the primary accent for each removable chip. */
const CHIP_TINT = withAlpha(colors.brand, 0.08);
const CHIP_TINT_PRESSED = withAlpha(colors.brand, 0.16);

export function ActiveFiltersBar({
  chips,
  onRemoveChip,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (chips.length === 0) return null;

  return (
    <View
      className="flex-row items-center border-b bg-surface pl-4 pr-2 py-2"
      style={{ borderColor: colors.border }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, alignItems: "center", paddingRight: 8 }}
        className="flex-1"
      >
        {chips.map((chip) => (
          <Pressable
            key={chip.id}
            onPress={() => onRemoveChip(chip.id)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label} filter`}
            hitSlop={6}
            className="flex-row items-center rounded-full px-2.5 py-1"
            style={({ pressed }) => ({
              backgroundColor: pressed ? CHIP_TINT_PRESSED : CHIP_TINT,
            })}
          >
            <Text
              className="text-label font-semibold"
              style={{ color: colors.primary }}
              numberOfLines={1}
            >
              {chip.label}
            </Text>
            <View className="ml-1.5">
              <Ionicons name="close" size={12} color={colors.primary} />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={onClearAll}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Clear all filters"
        className="rounded-md px-2 py-1 active:opacity-60"
      >
        <Text
          className="text-caption font-semibold"
          style={{ color: colors.textMuted }}
          numberOfLines={1}
        >
          Clear all
        </Text>
      </Pressable>
    </View>
  );
}