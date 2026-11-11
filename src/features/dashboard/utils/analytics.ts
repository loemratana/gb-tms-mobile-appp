import type { ManagerAssignedKpiResponse } from "@/features/tasks/types/task.types";
import { apiTaskStatusTone, toneColors } from "@/styles";

export type TaskStatusDonutDatum = {
  status: string;
  label: string;
  count: number;
  color: string;
};

export type WeeklyProductivityDatum = {
  day: string;
  completed: number;
};

export type EmployeeWorkloadDatum = {
  id: string;
  name: string;
  tasks: number;
};

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  TODO: { label: "To Do", color: toneColors[apiTaskStatusTone.TODO].color },
  IN_PROGRESS: { label: "In Progress", color: toneColors[apiTaskStatusTone.IN_PROGRESS].color },
  IN_REVIEW: { label: "Review", color: toneColors[apiTaskStatusTone.IN_REVIEW].color },
  DONE: { label: "Done", color: toneColors[apiTaskStatusTone.DONE].color },
  REJECTED: { label: "Rejected", color: toneColors[apiTaskStatusTone.REJECTED].color },
};

/** Status breakdown for tasks THIS manager assigned (from the assigned-KPI response). */
export function toManagerAssignedStatusDonutData(
  kpi: ManagerAssignedKpiResponse,
): TaskStatusDonutDatum[] {
  const counts: Record<string, number> = {
    TODO: kpi.todoTasks,
    IN_PROGRESS: kpi.pendingTasks,
    IN_REVIEW: kpi.reviewTasks,
    DONE: kpi.doneTasks,
    REJECTED: kpi.rejectedTasks,
  };

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      label: STATUS_DISPLAY[status]?.label ?? status,
      count,
      color: STATUS_DISPLAY[status]?.color ?? toneColors.faint.color,
    }));
}

/** Day-of-week label per ISO date, e.g. "2026-09-02" -> "Wed". */
function dayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/** Weekly completions for tasks THIS manager assigned (from the assigned-KPI response). */
export function toManagerAssignedWeeklyProductivityData(
  kpi: ManagerAssignedKpiResponse,
): WeeklyProductivityDatum[] {
  return kpi.weeklyCompletions.map((item) => ({
    day: dayLabel(item.date),
    completed: item.count,
  }));
}

/** Per-assignee workload among tasks THIS manager assigned (from the assigned-KPI response). */
export function toManagerAssignedEmployeeWorkloadData(
  kpi: ManagerAssignedKpiResponse,
): EmployeeWorkloadDatum[] {
  return kpi.memberWorkload.slice(0, 5).map((member) => ({
    id: member.memberId,
    name: member.memberName.split(" ")[0],
    tasks: member.taskCount,
  }));
}
