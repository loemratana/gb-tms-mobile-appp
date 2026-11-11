import { z } from "zod";

export const SCHEDULE_OPTIONS = [
  { id: "date" as const, label: "Date Range" },
  { id: "time" as const, label: "Time Range" },
  { id: "both" as const, label: "Date & Time" },
];

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
  })
  .superRefine((data, ctx) => refineSchedule(data, ctx));

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
