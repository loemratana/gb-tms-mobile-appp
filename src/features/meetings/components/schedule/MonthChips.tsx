import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import type { ScrollViewInstance } from "react-native";

import type { MonthOption } from "@/features/meetings/utils/meetingTime";

type MonthChipsProps = {
  months: MonthOption[];
  selectedDate: Date;
  onSelectMonth: (month: Date) => void;
};

const CHIP_WIDTH_ESTIMATE = 96;

/** Horizontal month pills; the selected month is outlined in brand blue. */
export function MonthChips({ months, selectedDate, onSelectMonth }: MonthChipsProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const selectedIndex = months.findIndex(
    (month) =>
      month.date.getFullYear() === selectedDate.getFullYear() && month.date.getMonth() === selectedDate.getMonth(),
  );

  useEffect(() => {
    if (selectedIndex > 0) {
      scrollRef.current?.scrollTo({ x: Math.max(0, (selectedIndex - 1) * CHIP_WIDTH_ESTIMATE), animated: false });
    }
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 -mx-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {months.map((month, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={month.key}
            onPress={() => onSelectMonth(month.date)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={`h-8 items-center justify-center rounded-full border px-4 ${
              isSelected ? "border-brand bg-brand-subtle" : "border-line bg-surface active:bg-field"
            }`}
          >
            <Text className={`text-caption ${isSelected ? "font-semibold text-brand-strong" : "font-medium text-fg-soft"}`}>
              {month.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
