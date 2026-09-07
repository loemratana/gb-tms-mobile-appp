import { useMemo } from "react";
import { View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { getStatusColor } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

type CalendarGridProps = {
  currentMonth: string;
  selectedDate: string;
  tasks: Task[];
  onSelectDate: (date: string) => void;
  onMonthChange: (month: DateData) => void;
};

export function CalendarGrid({
  currentMonth,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
}: CalendarGridProps) {
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    tasks.forEach((task) => {
      const key = task.dueDate;
      const color = getStatusColor(task.status);
      if (!marks[key]) {
        marks[key] = { dots: [], marked: true };
      }
      if (marks[key].dots.length < 3) {
        marks[key].dots.push({ key: task.id, color });
      }
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? { dots: [] }),
      selected: true,
      selectedColor: "#32CD32",
      selectedTextColor: "#FFFFFF",
    };

    return marks;
  }, [tasks, selectedDate]);

  return (
    <View
      className="mx-5 overflow-hidden rounded-3xl bg-white px-1 pb-2 pt-1"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      <Calendar
        key={currentMonth}
        current={currentMonth}
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        markingType="multi-dot"
        enableSwipeMonths
        hideArrows
        renderHeader={() => <View />}
        firstDay={1}
        theme={{
          backgroundColor: "#FFFFFF",
          calendarBackground: "#FFFFFF",
          textSectionTitleColor: "#9CA3AF",
          selectedDayBackgroundColor: "#32CD32",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#32CD32",
          todayBackgroundColor: "#ECFDF5",
          dayTextColor: "#111827",
          textDisabledColor: "#D1D5DB",
          dotColor: "#32CD32",
          selectedDotColor: "#FFFFFF",
          arrowColor: "#32CD32",
          monthTextColor: "#111827",
          textDayFontWeight: "500",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 14,
          textDayHeaderFontSize: 12,
          textMonthFontSize: 1,
        }}
      />
    </View>
  );
}
