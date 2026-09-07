import { Text, View } from "react-native";

import { TASK_STATUS_LABELS, buildTaskAgendaEntries, getTaskColor } from "@/features/manager/data/calendarTasks";
import { isSameDateKey } from "@/features/manager/data/timeline";
import type { TaskResponse } from "@/features/tasks/types/task.types";

type AgendaCalendarViewProps = {
  tasks: TaskResponse[];
};

function AgendaTaskChip({ task }: { task: TaskResponse }) {
  return (
    <View className="rounded-lg px-3 py-2" style={{ backgroundColor: getTaskColor(task) }}>
      <Text numberOfLines={1} className="text-[13px] font-semibold text-white">
        {task.title}
      </Text>
      <Text numberOfLines={1} className="mt-0.5 text-[11px] text-white/80">
        {TASK_STATUS_LABELS[task.status]} · {task.assignee?.name ?? "Unassigned"}
      </Text>
    </View>
  );
}

export function AgendaCalendarView({ tasks }: AgendaCalendarViewProps) {
  const entries = buildTaskAgendaEntries(tasks);
  const today = new Date();

  if (entries.length === 0) {
    return (
      <View className="items-center rounded-3xl bg-white py-14">
        <Text className="text-[15px] font-semibold text-[#111827]">No tasks</Text>
        <Text className="mt-1 text-[13px] text-[#6B7280]">Nothing with a due date scheduled</Text>
      </View>
    );
  }

  return (
    <View>
      {entries.map((entry, index) => {
        if (entry.kind === "gap") {
          return (
            <Text
              key={`gap-${index}`}
              className="mb-3 mt-1 text-[12px] font-medium text-[#9CA3AF]"
            >
              {entry.label}
            </Text>
          );
        }

        const isToday = isSameDateKey(entry.date, today);

        return (
          <View key={entry.date.toISOString()} className="mb-4 flex-row">
            <View className="w-12 items-center pt-1">
              <Text
                className="text-[15px] font-bold"
                style={{ color: isToday ? "#32CD32" : "#111827" }}
              >
                {entry.date.getDate()}
              </Text>
              <Text className="text-[10px] uppercase text-[#9CA3AF]">
                {entry.date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
            </View>

            <View className="flex-1 gap-1.5">
              {entry.tasks.map((task) => (
                <AgendaTaskChip key={task.id} task={task} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}
