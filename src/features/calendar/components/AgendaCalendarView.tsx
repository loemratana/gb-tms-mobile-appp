import { Text, View } from "react-native";

import { StateView } from "@/components/ui/StateView";
import { isSameDay } from "@/features/calendar/utils/calendarDates";
import { buildAgendaEntries } from "@/features/calendar/utils/calendarTasks";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import type { TaskResponse } from "@/features/tasks/types/task.types";

import { CalendarEventCard } from "./CalendarEventCard";
import { CalendarMeetingCard } from "./CalendarMeetingCard";

type AgendaCalendarViewProps = {
  monthDate: Date;
  tasks: TaskResponse[];
  meetings: BookingResponse[];
  onTaskPress?: (task: TaskResponse) => void;
  onMeetingPress?: (meeting: BookingResponse) => void;
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

/** The month in the header as a list: each busy day with its meetings (by time), then its due tasks. */
export function AgendaCalendarView({ monthDate, tasks, meetings, onTaskPress, onMeetingPress }: AgendaCalendarViewProps) {
  const entries = buildAgendaEntries(tasks, meetings, monthDate);
  const today = new Date();

  if (entries.length === 0) {
    return (
      <StateView
        variant="empty"
        icon="calendar-clear-outline"
        title="Nothing this month"
        message="Meetings and tasks with a due date show up here."
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
              {entry.meetings.map((meeting) => (
                <CalendarMeetingCard key={meeting.id} meeting={meeting} onPress={onMeetingPress} />
              ))}
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
