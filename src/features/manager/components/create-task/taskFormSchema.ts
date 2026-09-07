import { z } from "zod";

import type { Priority } from "@/features/tasks/types/task.types";

export const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: "LOW", label: "Low" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HIGH", label: "High" },
  { id: "URGENT", label: "Urgent" },
];

export const SCHEDULE_OPTIONS = [
  { id: "date" as const, label: "Date Range" },
  { id: "time" as const, label: "Time Range" },
  { id: "both" as const, label: "Date & Time" },
];

export const EMPLOYEES = [
  { id: "1", name: "Alex Rivera", avatar: "https://i.pravatar.cc/40?img=1" },
  { id: "2", name: "Jamie Chen", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: "3", name: "Taylor Smith", avatar: "https://i.pravatar.cc/40?img=3" },
  { id: "4", name: "Jordan Lee", avatar: "https://i.pravatar.cc/40?img=4" },
  { id: "5", name: "Morgan Kim", avatar: "https://i.pravatar.cc/40?img=5" },
  { id: "6", name: "Riley Patel", avatar: "https://i.pravatar.cc/40?img=6" },
] as const;

export type Employee = (typeof EMPLOYEES)[number];
export type ScheduleType = (typeof SCHEDULE_OPTIONS)[number]["id"];

export function refineSchedule(
  data: {
    scheduleType: ScheduleType;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
) {
  const issuePath = (field: string) => [...pathPrefix, field];
  const needsDate = data.scheduleType === "date" || data.scheduleType === "both";
  const needsTime = data.scheduleType === "time" || data.scheduleType === "both";

  if (needsDate) {
    if (!data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start date is required",
        path: issuePath("startDate"),
      });
    }
    if (!data.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date is required",
        path: issuePath("endDate"),
      });
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be on or after start date",
        path: issuePath("endDate"),
      });
    }
  }

  if (needsTime) {
    if (!data.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "Start time is required",
        path: issuePath("startTime"),
      });
    }
    if (!data.endTime) {
      ctx.addIssue({
        code: "custom",
        message: "End time is required",
        path: issuePath("endTime"),
      });
    }
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after start time",
        path: issuePath("endTime"),
      });
    }
  }
}

export const subtaskSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().optional(),
    inheritFromParent: z.boolean(),
    assignees: z.array(z.string()),
    scheduleType: z.enum(["date", "time", "both"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.inheritFromParent) {
      if (data.assignees.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Select at least one assignee",
          path: ["assignees"],
        });
      }
      refineSchedule(data, ctx);
    }
  });

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(5, "Add a short description"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    assignees: z.array(z.string()).min(1, "Select at least one assignee"),
    scheduleType: z.enum(["date", "time", "both"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    subtasks: z.array(subtaskSchema),
  })
  .superRefine((data, ctx) => refineSchedule(data, ctx));

export type SubtaskFormValues = z.infer<typeof subtaskSchema>;
export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const EMPTY_SUBTASK: SubtaskFormValues = {
  title: "",
  description: "",
  inheritFromParent: true,
  assignees: [],
  scheduleType: "date",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
};

export function resolveSubtaskForSubmit(
  subtask: SubtaskFormValues,
  parent: Pick<
    CreateTaskFormValues,
    | "description"
    | "assignees"
    | "scheduleType"
    | "startDate"
    | "endDate"
    | "startTime"
    | "endTime"
  >,
) {
  if (subtask.inheritFromParent) {
    return {
      title: subtask.title.trim(),
      description: subtask.description?.trim() || parent.description,
      assigneeId: parent.assignees[0],
      scheduleType: parent.scheduleType,
      startDate: parent.startDate,
      endDate: parent.endDate,
      startTime: parent.startTime,
      endTime: parent.endTime,
    };
  }

  return {
    title: subtask.title.trim(),
    description: subtask.description?.trim() || "",
    assigneeId: subtask.assignees[0],
    scheduleType: subtask.scheduleType,
    startDate: subtask.startDate,
    endDate: subtask.endDate,
    startTime: subtask.startTime,
    endTime: subtask.endTime,
  };
}
