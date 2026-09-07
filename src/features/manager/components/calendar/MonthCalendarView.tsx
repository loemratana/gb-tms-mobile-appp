import { useMemo } from "react";
import { Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { CalendarEventCard } from "@/features/manager/components/calendar/CalendarEventCard";
import { getTaskColor, getTasksForDate } from "@/features/manager/data/calendarTasks";
import { parseDateKey, toDateKey } from "@/features/manager/data/timeline";
import type { TaskResponse } from "@/features/tasks/types/task.types";

/** react-native-calendars doesn't publicly export its MarkedDates/dot-marking types, so this covers just the shape used here. */
type DayMarking = {
  dots?: { key: string; color: string }[];
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
};

type MonthCalendarViewProps = {
  monthDate: Date;
  selectedDate: Date;
  tasks: TaskResponse[];
  onSelectDate: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  onTaskPress?: (task: TaskResponse) => void;
};

export function MonthCalendarView({
  monthDate,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
  onTaskPress,
}: MonthCalendarViewProps) {
  const currentMonth = toDateKey(
    new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
  );
  const selectedKey = toDateKey(selectedDate);

  const markedDates = useMemo(() => {
    const marks: Record<string, DayMarking> = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = task.dueDate;
      const color = getTaskColor(task);
      const entry = marks[key] ?? { dots: [], marked: true };
      if ((entry.dots?.length ?? 0) < 3) {
        entry.dots = [...(entry.dots ?? []), { key: task.id, color }];
      }
      marks[key] = entry;
    });

    marks[selectedKey] = {
      ...(marks[selectedKey] ?? { dots: [] }),
      selected: true,
      selectedColor: "#32CD32",
      selectedTextColor: "#FFFFFF",
    };

    return marks;
  }, [tasks, selectedKey]);

  const selectedDayTasks = useMemo(
    () => getTasksForDate(tasks, selectedKey),
    [tasks, selectedKey],
  );

  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View>
      <View
        className="overflow-hidden rounded-3xl bg-white px-1 pb-2 pt-1"
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
          onDayPress={(day: DateData) => onSelectDate(parseDateKey(day.dateString))}
          onMonthChange={(month: DateData) => {
            onMonthChange?.(new Date(month.year, month.month - 1, 1));
          }}
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

      <View className="mt-5">
        <View className="mb-1 flex-row items-center justify-between px-1">
          <Text className="text-sm font-medium text-[#6B7280]">
            {selectedLabel}
          </Text>
          <Text className="text-xs font-medium text-[#9CA3AF]">
            {selectedDayTasks.length}{" "}
            {selectedDayTasks.length === 1 ? "task" : "tasks"}
          </Text>
        </View>

        <View className="mt-4">
          {selectedDayTasks.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-4 py-10">
              <Text className="text-base font-bold text-[#111827]">
                No tasks assigned
              </Text>
              <Text className="mt-1 text-center text-xs text-gray-500">
                No team tasks due this day
              </Text>
            </View>
          ) : (
            selectedDayTasks.map((task) => (
              <CalendarEventCard key={task.id} task={task} onPress={onTaskPress} />
            ))
          )}
        </View>
      </View>
    </View>
  );
}
