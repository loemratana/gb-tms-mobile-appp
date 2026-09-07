import { create } from "zustand";

import { mockTasks } from "@/features/employee/data/mockData";
import {
  getStatusLabel,
  getTaskDisplayProgress,
} from "@/features/employee/helpers/helpers";
import type { Task, TaskPriority, TaskStatus } from "@/features/employee/types/types";

type TasksState = {
  tasks: Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectName: string) => Task[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskPriority: (id: string, priority: TaskPriority) => void;
  reassignTask: (
    id: string,
    assignee: { name: string; avatarUrl?: string; role?: string },
  ) => void;
  approveTaskReview: (id: string) => void;
  rejectTaskReview: (id: string, reason: string) => void;
  createTask: (input: {
    title: string;
    description: string;
    assigneeName: string;
    priority?: "low" | "medium" | "high";
    scheduleType: "date" | "time" | "both";
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    projectName?: string;
    subtasks?: Array<{
      title: string;
      description: string;
      assigneeName: string;
      scheduleType: "date" | "time" | "both";
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    }>;
  }) => void;
  createManyTasks: (
    input: Array<{
      title: string;
      description: string;
      assigneeName: string;
      scheduleType: "date" | "time" | "both";
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
      projectName?: string;
    }>
  ) => void;
};

function progressForStatus(status: TaskStatus, current: number): number {
  return getTaskDisplayProgress({ status, progress: current });
}

function activityTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTaskTimeRange(startTime: string, endTime: string) {
  const format = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return `${format(startTime)} – ${format(endTime)}`;
}

/** Simulated API: PATCH /tasks/:id/status */
export async function patchTaskStatus(
  id: string,
  status: TaskStatus
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (!id) throw new Error("Task not found");
  void status;
}

/** Simulated API: POST /tasks/:id/review/approve */
export async function patchTaskReviewApprove(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (!id) throw new Error("Task not found");
}

/** Simulated API: POST /tasks/:id/review/reject */
export async function patchTaskReviewReject(
  id: string,
  reason: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (!id) throw new Error("Task not found");
  void reason;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: mockTasks,
  getTaskById: (id) => get().tasks.find((task) => task.id === id),
  getTasksByProject: (projectName) =>
    get().tasks.filter((task) => task.project === projectName),
  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        const activity = {
          id: `${id}-status-${Date.now()}`,
          title: `Status updated to ${getStatusLabel(status)}`,
          timestamp: activityTimestamp(),
          type: "status" as const,
        };

        return {
          ...task,
          status,
          progress: progressForStatus(status, task.progress),
          activities: [activity, ...(task.activities ?? [])],
        };
      }),
    })),
  updateTaskPriority: (id, priority) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        const activity = {
          id: `${id}-priority-${Date.now()}`,
          title: `Priority changed to ${priority}`,
          timestamp: activityTimestamp(),
          type: "status" as const,
        };

        return {
          ...task,
          priority,
          activities: [activity, ...(task.activities ?? [])],
        };
      }),
    })),
  reassignTask: (id, assignee) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        const activity = {
          id: `${id}-reassign-${Date.now()}`,
          title: `Reassigned to ${assignee.name}`,
          timestamp: activityTimestamp(),
          type: "status" as const,
        };

        return {
          ...task,
          assignees: [
            {
              name: assignee.name,
              avatarUrl: assignee.avatarUrl,
              role: assignee.role ?? "Team member",
            },
          ],
          activities: [activity, ...(task.activities ?? [])],
        };
      }),
    })),
  approveTaskReview: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        const activity = {
          id: `${id}-approved-${Date.now()}`,
          title: "Manager approved work — task completed",
          timestamp: activityTimestamp(),
          type: "status" as const,
        };

        return {
          ...task,
          status: "done",
          progress: 100,
          activities: [activity, ...(task.activities ?? [])],
        };
      }),
    })),
  rejectTaskReview: (id, reason) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        const activity = {
          id: `${id}-rejected-${Date.now()}`,
          title: `Manager rejected: ${reason}`,
          timestamp: activityTimestamp(),
          type: "comment" as const,
        };

        return {
          ...task,
          status: "in_progress",
          activities: [activity, ...(task.activities ?? [])],
        };
      }),
    })),
  createTask: (input) =>
    set((state) => {
      const id = `task-${Date.now()}`;
      const today = new Date().toISOString().split("T")[0];
      const assignee = {
        name: input.assigneeName,
        avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(input.assigneeName)}`,
        role: "Employee",
      };

      const usesDate =
        input.scheduleType === "date" || input.scheduleType === "both";
      const usesTime =
        input.scheduleType === "time" || input.scheduleType === "both";

      const startDate = usesDate ? input.startDate ?? today : today;
      const endDate = usesDate ? input.endDate ?? today : today;
      const time =
        usesTime && input.startTime && input.endTime
          ? formatTaskTimeRange(input.startTime, input.endTime)
          : undefined;

      const subtaskTasks = (input.subtasks ?? []).map((subtask, index) => {
        const subId = `task-${Date.now()}-sub-${index}`;
        const subAssignee = {
          name: subtask.assigneeName,
          avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(subtask.assigneeName)}`,
          role: "Employee",
        };

        const subUsesDate =
          subtask.scheduleType === "date" || subtask.scheduleType === "both";
        const subUsesTime =
          subtask.scheduleType === "time" || subtask.scheduleType === "both";

        const subStartDate = subUsesDate ? subtask.startDate ?? today : today;
        const subEndDate = subUsesDate ? subtask.endDate ?? today : today;
        const subTime =
          subUsesTime && subtask.startTime && subtask.endTime
            ? formatTaskTimeRange(subtask.startTime, subtask.endTime)
            : undefined;

        return {
          id: subId,
          title: subtask.title,
          description: subtask.description,
          status: "todo" as const,
          priority: input.priority ?? ("medium" as const),
          startDate: subStartDate,
          dueDate: subEndDate,
          time: subTime,
          progress: 0,
          assignees: [subAssignee],
          assignedManager: {
            name: "You",
            avatarUrl: "https://i.pravatar.cc/100?u=manager",
            role: "Manager",
          },
          category: "work" as const,
          project: input.projectName,
          parentId: id,
          activities: [
            {
              id: `${subId}-created`,
              title: "Subtask created",
              timestamp: activityTimestamp(),
              type: "created" as const,
            },
          ],
        };
      });

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
        assignees: [assignee],
        assignedManager: {
          name: "You",
          avatarUrl: "https://i.pravatar.cc/100?u=manager",
          role: "Manager",
        },
        category: "work",
        project: input.projectName,
        subtasks:
          subtaskTasks.length > 0
            ? subtaskTasks.map((subtask) => ({
                id: subtask.id,
                title: subtask.title,
                status: subtask.status,
                progress: subtask.progress,
                assigneeName: subtask.assignees[0]?.name ?? "Unassigned",
                assigneeAvatarUrl: subtask.assignees[0]?.avatarUrl,
              }))
            : undefined,
        activities: [
          {
            id: `${id}-created`,
            title: "Task created",
            timestamp: activityTimestamp(),
            type: "created",
          },
        ],
      };

      return { tasks: [task, ...subtaskTasks, ...state.tasks] };
    }),
  createManyTasks: (input) =>
    set((state) => {
      const now = Date.now();
      const tasks = input.map((item, index) => {
        const id = `task-${now}-${index}`;
        const today = new Date().toISOString().split("T")[0];
        const assignee = {
          name: item.assigneeName,
          avatarUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(item.assigneeName)}`,
          role: "Employee",
        };

        const usesDate =
          item.scheduleType === "date" || item.scheduleType === "both";
        const usesTime =
          item.scheduleType === "time" || item.scheduleType === "both";

        const startDate = usesDate ? item.startDate ?? today : today;
        const endDate = usesDate ? item.endDate ?? today : today;
        const time =
          usesTime && item.startTime && item.endTime
            ? formatTaskTimeRange(item.startTime, item.endTime)
            : undefined;

        return {
          id,
          title: item.title,
          description: item.description,
          status: "todo" as const,
          priority: "medium" as const,
          startDate,
          dueDate: endDate,
          time,
          progress: 0,
          assignees: [assignee],
          assignedManager: {
            name: "You",
            avatarUrl: "https://i.pravatar.cc/100?u=manager",
            role: "Manager",
          },
          category: "work" as const,
          project: item.projectName,
          activities: [
            {
              id: `${id}-created`,
              title: "Task created",
              timestamp: activityTimestamp(),
              type: "created" as const,
            },
          ],
        };
      });

      return { tasks: [...tasks, ...state.tasks] };
    }),
}));
