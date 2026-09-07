import { isTaskOverdue } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";

export type PerformanceMetric = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
};

export type EmployeePerformance = {
  completed: number;
  inProgress: number;
  overdue: number;
  active: number;
  completionRate: number;
  performanceLevel: string;
  metrics: PerformanceMetric[];
};

const GOOD_COMPLETION_RATE = 50;
const EXCELLENT_COMPLETION_RATE = 80;

export function getPerformanceLevel(taskCount: number, completionRate: number): string {
  if (taskCount === 0) return "No tasks yet";
  if (completionRate >= EXCELLENT_COMPLETION_RATE) return "Excellent 🏆";
  if (completionRate >= GOOD_COMPLETION_RATE) return "Good";
  return "Needs Improvement";
}

export function computeEmployeePerformance(tasks: Task[]): EmployeePerformance {
  const completed = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const overdue = tasks.filter(isTaskOverdue).length;
  const active = tasks.filter(
    (task) => task.status === "todo" || task.status === "in_progress" || task.status === "review",
  ).length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const metrics: PerformanceMetric[] = [
    { label: "Assigned Tasks", value: String(tasks.length) },
    { label: "Completed Tasks", value: String(completed), tone: "success" },
    { label: "In Progress", value: String(inProgress) },
    {
      label: "Overdue Tasks",
      value: String(overdue),
      tone: overdue > 0 ? "danger" : undefined,
    },
    { label: "Completion Rate", value: `${completionRate}%`, tone: "success" },
    { label: "Active Tasks", value: String(active) },
  ];

  return {
    completed,
    inProgress,
    overdue,
    active,
    completionRate,
    performanceLevel: getPerformanceLevel(tasks.length, completionRate),
    metrics,
  };
}
