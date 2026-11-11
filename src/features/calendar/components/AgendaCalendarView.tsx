import { Text, View } from "react-native";

import { StateView } from "@/components/ui/StateView";
import { CalendarEventCard } from "./CalendarEventCard";
import { buildTaskAgendaEntries } from "@/features/calendar/utils/calendarTasks";
import { isSameDay } from "@/features/calendar/utils/calendarDates";
import type { TaskResponse } from "@/features/tasks/types/task.types";

type AgendaCalendarViewProps = {
  tasks: TaskResponse[];
  onTaskPress?: (task: TaskResponse) => void;
};

/** Date column for one agenda day; today is a filled brand circle. */
function AgendaDate({ date, isToday }: { date: Date; isToday: boolean }) {
  return (
    <View className="w-12 items-center pt-1">
      <Text className={`text-micro font-semibold uppercase ${isToday ? "text-brand-strong" : "text-fg-faint"}`}>
        {date.toLocaleDateString("en-US", { weekday: "short" })}
      </Text>
      <View className={`mt-1 h-9 w-9 items-center justify-center rounded-full ${isToday ? "bg-brand" : ""}`}>
        <Text className={`text-headline font-bold ${isToday ? "text-white" : "text-fg"}`}>{date.getDate()}</Text>
      </View>
    </View>
  );
}

export function AgendaCalendarView({ tasks, onTaskPress }: AgendaCalendarViewProps) {
  const entries = buildTaskAgendaEntries(tasks);
  const today = new Date();

  if (entries.length === 0) {
    return (
      <StateView
        variant="empty"
        icon="calendar-clear-outline"
        title="No tasks scheduled"
        message="Tasks with a due date will show up here"
      />
    );
  }

  return (
    <View>
      {entries.map((entry, index) => {
        if (entry.kind === "gap") {
          return (
            <View key={`gap-${index}`} className="mb-4 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-line" />
              <Text className="text-label font-medium text-fg-faint">{entry.label}</Text>
              <View className="h-px flex-1 bg-line" />
            </View>
          );
        }

        return (
          <View key={entry.date.toISOString()} className="mb-4 flex-row gap-2">
            <AgendaDate date={entry.date} isToday={isSameDay(entry.date, today)} />
            <View className="min-w-0 flex-1 gap-2">
              {entry.tasks.map((task) => (
                <CalendarEventCard key={task.id} task={task} onPress={onTaskPress} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}
