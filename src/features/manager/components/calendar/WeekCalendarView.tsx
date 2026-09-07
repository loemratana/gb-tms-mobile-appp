import { useMemo } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

import { getTaskColor, getTasksForDate } from "@/features/manager/data/calendarTasks";
import { getWeekDays, parseDateKey, toDateKey } from "@/features/manager/data/timeline";
import type { TaskResponse } from "@/features/tasks/types/task.types";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  android: { elevation: 1 },
});

const MAX_VISIBLE_TASKS = 4;

type WeekCalendarViewProps = {
  monthDate: Date;
  selectedDate: Date;
  tasks: TaskResponse[];
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onOpenDay: (date: Date) => void;
};

export function WeekCalendarView({
  monthDate,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
  onOpenDay,
}: WeekCalendarViewProps) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);
  const monthKey = toDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));

  const markedDates = useMemo(() => {
    const marks: Record<string, { selected: boolean; selectedColor: string; selectedTextColor: string }> = {};
    for (const day of weekDays) {
      const key = toDateKey(day);
      const isSelected = key === selectedKey;
      marks[key] = {
        selected: true,
        selectedColor: isSelected ? "#32CD32" : "#ECFDF5",
        selectedTextColor: isSelected ? "#FFFFFF" : "#111827",
      };
    }
    return marks;
  }, [weekDays, selectedKey]);

  return (
    <View>
      <View className="overflow-hidden rounded-3xl bg-white px-1 pb-2 pt-1" style={CARD_SHADOW}>
        <Calendar
          key={monthKey}
          current={monthKey}
          onDayPress={(day: DateData) => onSelectDate(parseDateKey(day.dateString))}
          onMonthChange={(month: DateData) => onMonthChange(new Date(month.year, month.month - 1, 1))}
          markedDates={markedDates}
          enableSwipeMonths
          hideArrows
          renderHeader={() => <View />}
          firstDay={1}
          theme={{
            backgroundColor: "#FFFFFF",
            calendarBackground: "#FFFFFF",
            textSectionTitleColor: "#9CA3AF",
            todayTextColor: "#32CD32",
            todayBackgroundColor: "#ECFDF5",
            dayTextColor: "#111827",
            textDisabledColor: "#D1D5DB",
            arrowColor: "#32CD32",
            monthTextColor: "#111827",
            textDayFontWeight: "500",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 13,
            textDayHeaderFontSize: 11,
            textMonthFontSize: 1,
          }}
        />
      </View>

      <View className="mt-4 flex-row overflow-hidden rounded-3xl bg-white" style={CARD_SHADOW}>
        {weekDays.map((day, index) => {
          const key = toDateKey(day);
          const dayTasks = getTasksForDate(tasks, key);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const visible = dayTasks.slice(0, MAX_VISIBLE_TASKS);
          const overflow = dayTasks.length - visible.length;

          return (
            <Pressable
              key={key}
              onPress={() => onOpenDay(day)}
              className="flex-1 px-1 pb-2 pt-2"
              style={{
                borderLeftWidth: index === 0 ? 0 : 1,
                borderLeftColor: "#F0F2F5",
                backgroundColor: isSelected ? "#F0FDF4" : "transparent",
              }}
            >
              <View className="items-center">
                <Text className="text-[10px] font-medium uppercase text-[#9CA3AF]">
                  {day.toLocaleDateString("en-US", { weekday: "narrow" })}
                </Text>
                <View
                  className="mt-0.5 h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: isToday ? "#32CD32" : "transparent" }}
                >
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: isToday ? "#FFFFFF" : "#111827" }}
                  >
                    {day.getDate()}
                  </Text>
                </View>
              </View>

              <View className="mt-2 gap-1">
                {visible.map((task) => (
                  <View
                    key={task.id}
                    className="rounded px-1 py-0.5"
                    style={{ backgroundColor: getTaskColor(task) }}
                  >
                    <Text numberOfLines={1} className="text-[8px] font-semibold text-white">
                      {task.title}
                    </Text>
                  </View>
                ))}
                {overflow > 0 ? (
                  <Text className="text-center text-[8px] font-medium text-[#9CA3AF]">
                    +{overflow}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
