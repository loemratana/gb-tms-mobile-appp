import { Platform, Pressable, Text, View } from "react-native";

import { TASK_STATUS_LABELS, getTaskColor, getTasksForDate } from "@/features/manager/data/calendarTasks";
import { addDays, toDateKey } from "@/features/manager/data/timeline";
import type { TaskResponse } from "@/features/tasks/types/task.types";

const VISIBLE_DAYS = 3;

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  android: { elevation: 1 },
});

type DayCalendarViewProps = {
  date: Date;
  tasks: TaskResponse[];
  onSelectDate: (date: Date) => void;
};

function DayColumn({ tasks, isToday }: { tasks: TaskResponse[]; isToday: boolean }) {
  return (
    <View className="flex-1 gap-1.5 border-l border-[#F0F2F5] px-1.5 py-2">
      {tasks.length === 0 ? (
        <Text className="mt-2 text-center text-[11px] text-[#D1D5DB]">
          {isToday ? "Nothing due" : ""}
        </Text>
      ) : (
        tasks.map((task) => (
          <View
            key={task.id}
            className="rounded-md px-1.5 py-1"
            style={{ backgroundColor: getTaskColor(task) }}
          >
            <Text numberOfLines={2} className="text-[10px] font-semibold text-white">
              {task.title}
            </Text>
            <Text numberOfLines={1} className="text-[9px] text-white/80">
              {TASK_STATUS_LABELS[task.status]}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

export function DayCalendarView({ date, tasks, onSelectDate }: DayCalendarViewProps) {
  const todayKey = toDateKey(new Date());
  const days = Array.from({ length: VISIBLE_DAYS }, (_, index) => addDays(date, index));

  return (
    <View className="overflow-hidden rounded-3xl bg-white" style={CARD_SHADOW}>
      <View className="flex-row border-b border-[#F0F2F5]">
        {days.map((day) => {
          const isToday = toDateKey(day) === todayKey;
          return (
            <Pressable
              key={toDateKey(day)}
              onPress={() => onSelectDate(day)}
              className="flex-1 items-center py-2.5"
            >
              <Text className="text-[11px] font-medium uppercase text-[#9CA3AF]">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <View
                className="mt-1 h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: isToday ? "#32CD32" : "transparent" }}
              >
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: isToday ? "#FFFFFF" : "#111827" }}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row">
        {days.map((day) => (
          <DayColumn
            key={toDateKey(day)}
            tasks={getTasksForDate(tasks, toDateKey(day))}
            isToday={toDateKey(day) === todayKey}
          />
        ))}
      </View>
    </View>
  );
}
