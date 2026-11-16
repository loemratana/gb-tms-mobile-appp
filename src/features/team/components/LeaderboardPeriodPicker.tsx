import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  LEADERBOARD_PERIOD_OPTIONS,
  currentSelection,
  formatSelection,
  formatSelectionHint,
  isCurrentSelection,
  shiftSelection,
  type LeaderboardSelection,
} from "@/features/team/utils/leaderboardPeriod";
import { colors } from "@/styles";

type LeaderboardPeriodPickerProps = {
  value: LeaderboardSelection;
  onChange: (selection: LeaderboardSelection) => void;
};

/** Monthly / Quarterly switch, then ‹ November 2026 › to step through periods (never past the current one). */
export function LeaderboardPeriodPicker({ value, onChange }: LeaderboardPeriodPickerProps) {
  const isLatest = isCurrentSelection(value);
  const hint = formatSelectionHint(value);

  return (
    <View className="gap-3">
      <SegmentedControl
        options={LEADERBOARD_PERIOD_OPTIONS}
        value={value.period}
        onChange={(period) => onChange(currentSelection(period))}
      />
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => onChange(shiftSelection(value, -1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous period"
          className="h-8 w-8 items-center justify-center rounded-full bg-field active:opacity-70"
        >
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        </Pressable>
        <View className="items-center">
          <Text className="text-body-sm font-semibold text-fg">{formatSelection(value)}</Text>
          {hint ? <Text className="text-micro text-fg-faint">{hint}</Text> : null}
        </View>
        <Pressable
          onPress={isLatest ? undefined : () => onChange(shiftSelection(value, 1))}
          disabled={isLatest}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next period"
          accessibilityState={{ disabled: isLatest }}
          className={`h-8 w-8 items-center justify-center rounded-full bg-field ${isLatest ? "opacity-40" : "active:opacity-70"}`}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}
