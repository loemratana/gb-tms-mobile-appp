import { mockTasks } from "@/features/employee/data/mockData";
import type { Task, TaskPriority } from "@/features/employee/types/types";

/**
 * Data layer for the manager "project tasks" feature (see
 * ManagerProjectDetailScreen / TaskContext). This feature was never wired to
 * the real backend, so these functions simulate network latency over the
 * same mock dataset the old tasksStore used — swap the bodies for real
 * `fetch`/service calls later without touching the reducer or components.
 *
 * Screen / action function -> this service -> dispatch() -> reducer -> new state
 * Reducers must never call these directly — see the comment on taskReducer.
 */

const SIMULATED_LATENCY_MS = 650;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function activityTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTaskTimeRange(startTime: string, endTime: string): string {
  const format = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return `${format(startTime)} – ${format(endTime)}`;
}

export type CreateProjectTaskInput = {
  title: string;
  description: string;
  assigneeName: string;
  priority?: TaskPriority;
  scheduleType: "date" | "time" | "both";
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  projectName?: string;
};

/** Simulated `GET /tasks`. */
export async function fetchProjectTasks(): Promise<Task[]> {
  return delay(mockTasks);
}

/** Simulated `POST /tasks`. */
export async function createProjectTask(input: CreateProjectTaskInput): Promise<Task> {
  const id = `task-${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];

  const usesDate = input.scheduleType === "date" || input.scheduleType === "both";
  const usesTime = input.scheduleType === "time" || input.scheduleType === "both";
  const startDate = usesDate ? (input.startDate ?? today) : today;
  const endDate = usesDate ? (input.endDate ?? today) : today;
  const time =
    usesTime && input.startTime && input.endTime
      ? formatTaskTimeRange(input.startTime, input.endTime)
      : undefined;

  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority ?? "medium",
    startDate,
    dueDate: endDate,
    time,
    progress: 0,
    assignees: [
      {
        name: input.assigneeName,
        avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(input.assigneeName)}`,
        role: "Employee",
      },
    ],
    assignedManager: {
      name: "You",
      avatarUrl: "https://i.pravatar.cc/100?u=manager",
      role: "Manager",
    },
    category: "work",
    project: input.projectName,
    activities: [
      {
        id: `${id}-created`,
        title: "Task created",
        timestamp: activityTimestamp(),
        type: "created",
      },
    ],
  };

  return delay(task);
}

/** Simulated `POST /tasks/:id/review/approve` (marks the task done). */
export async function completeProjectTask(id: string): Promise<void> {
  if (!id) throw new Error("Task not found");
  await delay(undefined);
}

/** Simulated `PATCH /tasks/:id`. Returns the fields the server accepted so the caller can merge them in. */
export async function updateProjectTask(id: string, changes: Partial<Task>): Promise<Partial<Task>> {
  if (!id) throw new Error("Task not found");
  return delay(changes);
}

/** Simulated `DELETE /tasks/:id`. */
export async function deleteProjectTask(id: string): Promise<void> {
  if (!id) throw new Error("Task not found");
  await delay(undefined);
}
