import type { LucideIcon } from "lucide-react-native";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  ListTodo,
} from "lucide-react-native";

import type { StatCardVariant } from "@/features/components/ui/StatCard";
import type { ManagerAssignedKpiResponse } from "@/features/tasks/types/task.types";

export type ManagerKpi = {
  id: string;
  title: string;
  value: string;
  label: string;
  icon: LucideIcon;
  variant: StatCardVariant;
};

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
  TODO: { label: "To Do", color: "#9CA3AF" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6" },
  IN_REVIEW: { label: "Review", color: "#8B5CF6" },
  DONE: { label: "Done", color: "#32CD32" },
  REJECTED: { label: "Rejected", color: "#EF4444" },
};

/**
 * The 6 KPI cards on the manager dashboard — counts of tasks THIS manager has
 * assigned, not the (often-empty) manager_id "direct reports" team.
 */
export function toManagerAssignedKpis(kpi: ManagerAssignedKpiResponse): ManagerKpi[] {
  return [
    {
      id: "total",
      title: "Total Assigned",
      value: String(kpi.totalTasks),
      label: "Tasks",
      icon: ClipboardList,
      variant: "blue",
    },
    {
      id: "pending",
      title: "Pending",
      value: String(kpi.pendingTasks),
      label: "In progress",
      icon: Clock,
      variant: "cream",
    },
    {
      id: "todo",
      title: "To Do",
      value: String(kpi.todoTasks),
      label: "Not started",
      icon: ListTodo,
      variant: "gray",
    },
    {
      id: "review",
      title: "Review",
      value: String(kpi.reviewTasks),
      label: "Awaiting review",
      icon: Eye,
      variant: "lavender",
    },
    {
      id: "done",
      title: "Done",
      value: String(kpi.doneTasks),
      label: "Completed",
      icon: CheckCircle2,
      variant: "mint",
    },
    {
      id: "overdue",
      title: "Overdue",
      value: String(kpi.overdueTasks),
      label: "Past due",
      icon: AlertTriangle,
      variant: "pink",
    },
  ];
}

/** Status breakdown for tasks THIS manager assigned — same scope as {@link toManagerAssignedKpis}. */
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
      color: STATUS_DISPLAY[status]?.color ?? "#9CA3AF",
    }));
}

/** Day-of-week label per ISO date, e.g. "2026-09-02" -> "Wed". */
function dayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/** Weekly completions for tasks THIS manager assigned — same scope as {@link toManagerAssignedKpis}. */
export function toManagerAssignedWeeklyProductivityData(
  kpi: ManagerAssignedKpiResponse,
): WeeklyProductivityDatum[] {
  return kpi.weeklyCompletions.map((item) => ({
    day: dayLabel(item.date),
    completed: item.count,
  }));
}

/** Per-assignee workload among tasks THIS manager assigned — same scope as {@link toManagerAssignedKpis}. */
export function toManagerAssignedEmployeeWorkloadData(
  kpi: ManagerAssignedKpiResponse,
): EmployeeWorkloadDatum[] {
  return kpi.memberWorkload.slice(0, 5).map((member) => ({
    id: member.memberId,
    name: member.memberName.split(" ")[0],
    tasks: member.taskCount,
  }));
}
