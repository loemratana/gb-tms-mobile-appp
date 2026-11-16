import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ModalSheet } from "@/components/ui/ModalSheet";
import { toDateKey } from "@/features/calendar/utils/calendarDates";
import {
  PERFORMANCE_PRESETS,
  buildRangeMarks,
  formatPerformanceRange,
  type PerformanceRange,
} from "@/features/team/utils/performancePeriod";
import { colors } from "@/styles";

type PerformanceRangeSheetProps = {
  visible: boolean;
  value: PerformanceRange;
  onClose: () => void;
  onApply: (range: PerformanceRange) => void;
};

type Draft = { from: string | null; to: string | null };

function draftFrom(range: PerformanceRange): Draft {
  return range.kind === "custom" ? { from: range.from, to: range.to } : { from: null, to: null };
}

/**
 * Choose the performance period: a quick preset (applies at once), or any range on the calendar —
 * tap the first day, then the last day, then Apply.
 */
export function PerformanceRangeSheet({ visible, value, onClose, onApply }: PerformanceRangeSheetProps) {
  const today = toDateKey(new Date());
  const [draft, setDraft] = useState<Draft>(() => draftFrom(value));
  const [wasVisible, setWasVisible] = useState(visible);
  // Start from the applied range each time the sheet opens (adjusting state during render).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(draftFrom(value));
  }

  const handleDayPress = (day: DateData) => {
    const key = day.dateString;
    setDraft((current) => {
      // No start yet, or a full range already: this tap starts a new range.
      if (!current.from || current.to) return { from: key, to: null };
      // Tapped before the start: that day becomes the start instead.
      if (key < current.from) return { from: key, to: null };
      return { from: current.from, to: key };
    });
  };

  const markedDates = useMemo(
    () =>
      draft.from
        ? buildRangeMarks(draft.from, draft.to, {
            edge: colors.brand,
            edgeText: colors.textInverse,
            middle: colors.brandSubtle,
            middleText: colors.brandStrong,
          })
        : {},
    [draft],
  );

  const handleApply = () => {
    if (!draft.from) return;
    onApply({ kind: "custom", from: draft.from, to: draft.to ?? draft.from });
  };

  const hint = !draft.from
    ? "Tap the first day of the range."
    : !draft.to
      ? "Now tap the last day, or Apply for just this day."
      : formatPerformanceRange({ kind: "custom", from: draft.from, to: draft.to });

  return (
    <ModalSheet
      visible={visible}
      title="Performance period"
      onClose={onClose}
      maxHeight="92%"
      footer={<Button label="Apply" onPress={handleApply} disabled={!draft.from} />}
    >
      <View className="flex-row flex-wrap gap-2">
        {PERFORMANCE_PRESETS.map((preset) => (
          <Chip
            key={preset.value}
            label={preset.label}
            isActive={value.kind === preset.value}
            color={colors.brand}
            selectedVariant="solid"
            onPress={() => onApply({ kind: preset.value })}
          />
        ))}
      </View>

      <Text className="mb-1 mt-4 text-label font-semibold uppercase tracking-wide text-fg-soft">Custom range</Text>
      <Text className="mb-2 text-caption text-fg-soft">{hint}</Text>

      <Calendar
        current={draft.from ?? today}
        maxDate={today}
        firstDay={1}
        markingType="period"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths
        theme={{
          calendarBackground: colors.surface,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          textDisabledColor: colors.textSubtle,
          textSectionTitleColor: colors.textSubtle,
          todayTextColor: colors.brand,
          arrowColor: colors.brand,
          textDayFontWeight: "500",
          textMonthFontWeight: "700",
          textDayHeaderFontWeight: "600",
        }}
      />
    </ModalSheet>
  );
}
