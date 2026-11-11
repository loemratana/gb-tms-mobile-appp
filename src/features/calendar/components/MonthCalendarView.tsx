import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { CalendarEventCard } from "./CalendarEventCard";
import { getTaskColor, getTasksForDate } from "@/features/calendar/utils/calendarTasks";
import { parseDateKey, toDateKey } from "@/features/calendar/utils/calendarDates";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { colors, toneColors } from "@/styles";

const MAX_DOTS = 3;

/** react-native-calendars doesn't export its marking type, so this covers just the shape used here. */
type DayMarking = {
  dots?: { key?: string; color: string }[];
  selected?: boolean;
};

type DayCellProps = {
  date?: DateData;
  state?: "selected" | "disabled" | "inactive" | "today" | "";
  marking?: DayMarking;
  onPress?: (date?: DateData) => void;
};

/** One day in the month grid: a rounded square for the number, status dots underneath. */
const DayCell = memo(function DayCell({ date, state, marking, onPress }: DayCellProps) {
  if (!date) return <View className="h-12 w-11" />;

  const isSelected = Boolean(marking?.selected);
  const isToday = state === "today";
  const isOutsideMonth = state === "disabled" || state === "inactive";
  const dots = marking?.dots ?? [];

  const squareClass = isSelected ? "bg-brand" : isToday ? "bg-brand-subtle" : "bg-transparent";
  const textClass = isSelected
    ? "text-white font-bold"
    : isToday
      ? "text-brand-strong font-bold"
      : isOutsideMonth
        ? "text-fg-faint"
        : "text-fg font-medium";

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      accessibilityRole="button"
      accessibilityLabel={`${parseDateKey(date.dateString).toDateString()}${
        dots.length ? `, ${dots.length} task${dots.length === 1 ? "" : "s"}` : ""
      }`}
      accessibilityState={{ selected: isSelected }}
      className="h-12 w-11 items-center"
    >
      <View className={`h-9 w-9 items-center justify-center rounded-lg ${squareClass}`}>
        <Text className={`text-body-sm ${textClass}`}>{date.day}</Text>
      </View>
      <View className="mt-1 h-1.5 flex-row gap-0.5">
        {dots.slice(0, MAX_DOTS).map((dot, index) => (
          <View
            key={dot.key ?? index}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dot.color, opacity: isOutsideMonth ? 0.4 : 1 }}
          />
        ))}
      </View>
    </Pressable>
  );
});

const LEGEND = [
  { label: "To do", color: toneColors.warning.color },
  { label: "In progress", color: toneColors.info.color },
  { label: "Review", color: toneColors.violet.color },
  { label: "Done", color: toneColors.success.color },
  { label: "Overdue", color: toneColors.error.color },
];

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
  const currentMonth = toDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const selectedKey = toDateKey(selectedDate);

  const markedDates = useMemo(() => {
    const marks: Record<string, DayMarking> = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const entry = marks[task.dueDate] ?? { dots: [] };
      entry.dots = [...(entry.dots ?? []), { key: task.id, color: getTaskColor(task) }];
      marks[task.dueDate] = entry;
    });
    marks[selectedKey] = { ...(marks[selectedKey] ?? { dots: [] }), selected: true };
    return marks;
  }, [tasks, selectedKey]);

  const selectedDayTasks = useMemo(() => getTasksForDate(tasks, selectedKey), [tasks, selectedKey]);

  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View>
      <View className="overflow-hidden rounded-2xl border border-line bg-surface px-1 pb-3 pt-1">
        <Calendar
          key={currentMonth}
          current={currentMonth}
          onDayPress={(day: DateData) => onSelectDate(parseDateKey(day.dateString))}
          onMonthChange={(month: DateData) => {
            onMonthChange?.(new Date(month.year, month.month - 1, 1));
          }}
          markedDates={markedDates}
          dayComponent={DayCell}
          enableSwipeMonths
          hideArrows
          renderHeader={() => <View />}
          firstDay={1}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSubtle,
            textDayHeaderFontWeight: "600",
            textDayHeaderFontSize: 12,
            textMonthFontSize: 1,
          }}
        />

        <View className="mx-3 mt-1 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-line-soft pt-3">
          {LEGEND.map((item) => (
            <View key={item.label} className="flex-row items-center gap-1">
              <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <Text className="text-micro text-fg-soft">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <SectionHeader
          title={selectedLabel}
          meta={`${selectedDayTasks.length} ${selectedDayTasks.length === 1 ? "task" : "tasks"}`}
        />
        {selectedDayTasks.length === 0 ? (
          <StateView
            variant="empty"
            icon="calendar-clear-outline"
            title="No tasks"
            message="Nothing is due on this day"
            isCompact
          />
        ) : (
          <View className="gap-3">
            {selectedDayTasks.map((task) => (
              <CalendarEventCard key={task.id} task={task} onPress={onTaskPress} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
