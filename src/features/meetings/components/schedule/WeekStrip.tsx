import { Pressable, Text, View } from "react-native";

import { IconButton } from "@/components/ui/IconButton";
import { addDays, isSameDay } from "@/features/calendar/utils/calendarDates";

type WeekStripProps = {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

/** Sun–Sat row of round day buttons with previous / next week arrows. */
export function WeekStrip({ weekDays, selectedDate, onSelectDate }: WeekStripProps) {
  const today = new Date();

  return (
    <View className="mt-3 flex-row items-center">
      <IconButton
        icon="chevron-back"
        variant="ghost"
        accessibilityLabel="Previous week"
        onPress={() => onSelectDate(addDays(selectedDate, -7))}
      />
      <View className="flex-1 flex-row justify-between">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const weekday = day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onSelectDate(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              className="items-center gap-1"
            >
              <Text className="text-micro font-medium text-fg-faint">{weekday}</Text>
              <View
                className={`h-9 w-9 items-center justify-center rounded-full border ${
                  isSelected ? "border-brand bg-brand" : isToday ? "border-brand-border bg-brand-subtle" : "border-line bg-surface"
                }`}
              >
                <Text className={`text-body-sm font-semibold ${isSelected ? "text-white" : "text-fg"}`}>
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <IconButton
        icon="chevron-forward"
        variant="ghost"
        accessibilityLabel="Next week"
        onPress={() => onSelectDate(addDays(selectedDate, 7))}
      />
    </View>
  );
}
