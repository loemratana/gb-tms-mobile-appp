import type {
  Priority,
  TaskResponse,
  TaskStatus as RealTaskStatus,
} from "@/features/tasks/types/task.types";
import type {
  Task,
  TaskActivity,
  TaskPriority,
  TaskStatus,
} from "@/features/employee/types/types";

/**
 * The employee UI's 5-state model predates the backend's 8-state workflow and
 * is display-only from here on — the real status change flow (confirming a
 * task, submitting work) works off `TaskResponse.status` directly, not this
 * mapping.
 * APPROVED reads as "done" (nothing left for the employee to do); REJECTED reads
 * as "in_progress" (the employee's next step is to keep working), matching the
 * only forward transitions the backend allows for each.
 */
const STATUS_MAP: Record<RealTaskStatus, TaskStatus> = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "review",
  APPROVED: "done",
  REJECTED: "in_progress",
  DONE: "done",
  CANCELLED: "cancelled",
  BLOCKED: "todo",
};

const PRIORITY_MAP: Record<Priority, TaskPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const REAL_STATUS_LABELS: Record<RealTaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DONE: "Done",
  CANCELLED: "Cancelled",
  BLOCKED: "Blocked",
};

export function mapTaskStatus(status: RealTaskStatus): TaskStatus {
  return STATUS_MAP[status];
}

export function mapTaskPriority(priority: Priority): TaskPriority {
  return PRIORITY_MAP[priority];
}

/** Minimal, honest timeline from real fields only — no fabricated progression. */
function deriveActivities(response: TaskResponse): TaskActivity[] {
  const activities: TaskActivity[] = [
    {
      id: `${response.id}-created`,
      title: "Task created",
      timestamp: response.createdAt,
      type: "created",
    },
  ];

  if (response.completedAt) {
    activities.unshift({
      id: `${response.id}-completed`,
      title: "Marked complete",
      timestamp: response.completedAt,
      type: "status",
    });
  }

  return activities;
}

export function mapTaskResponseToEmployeeTask(response: TaskResponse): Task {
  return {
    id: response.id,
    title: response.title,
    description: response.description ?? "",
    status: mapTaskStatus(response.status),
    priority: mapTaskPriority(response.priority),
    dueDate: response.dueDate ?? response.startDate ?? response.createdAt,
    startDate: response.startDate ?? undefined,
    progress: response.progress,
    assignees: (response.assignees ?? []).map((person) => ({
      id: person.id,
      name: person.name,
      avatarUrl: person.avatarUrl ?? undefined,
      role: "Employee",
    })),
    assignedManager: response.assignedBy
      ? {
          id: response.assignedBy.id,
          name: response.assignedBy.name,
          avatarUrl: response.assignedBy.avatarUrl ?? undefined,
          role: "Manager",
        }
      : { name: "Unassigned", role: "Manager" },
    parentId: response.parentTaskId ?? undefined,
    team: response.department?.name,
    activities: deriveActivities(response),
    commentCount: response.commentCount ?? response.comments?.length ?? 0,
    attachmentCount: response.attachmentCount ?? response.attachments?.length ?? 0,
  };
}
