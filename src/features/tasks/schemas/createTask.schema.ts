import { z } from "zod";

import { toDateKey } from "@/features/calendar/utils/calendarDates";

/**
 * Mirrors the API's CreateTaskRequest: the task only has date-only `startDate` and `dueDate`
 * (no times), and both must be today or later (@FutureOrPresent).
 */
export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 5000;

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(TASK_TITLE_MAX_LENGTH, `Keep the title under ${TASK_TITLE_MAX_LENGTH} characters`),
    /** Optional: a short title is often enough ("Call the supplier"). */
    description: z
      .string()
      .trim()
      .max(TASK_DESCRIPTION_MAX_LENGTH, `Keep the description under ${TASK_DESCRIPTION_MAX_LENGTH} characters`),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    /**
     * Who gets the task. PEOPLE = the picked `assignees`; DEPARTMENT = everyone in the chosen
     * department; POSITION = everyone holding `positionId`. Only admins see the last two.
     */
    assignTo: z.enum(["PEOPLE", "DEPARTMENT", "POSITION"]),
    assignees: z.array(z.string()),
    positionId: z.string().optional(),
    /** Only used with two or more assignees. */
    assignmentMode: z.enum(["INDIVIDUAL", "SHARED"]),
    startDate: z.string().min(1, "Start date is required"),
    dueDate: z.string().min(1, "Due date is required"),
  })
  .superRefine((data, ctx) => {
    // "YYYY-MM-DD" strings compare correctly as plain text.
    if (data.assignTo === "PEOPLE" && data.assignees.length === 0) {
      ctx.addIssue({ code: "custom", message: "Select at least one assignee", path: ["assignees"] });
    }
    if (data.assignTo === "POSITION" && !data.positionId) {
      ctx.addIssue({ code: "custom", message: "Choose a position", path: ["positionId"] });
    }
    const today = toDateKey(new Date());
    if (data.startDate && data.startDate < today) {
      ctx.addIssue({ code: "custom", message: "Start date can't be in the past", path: ["startDate"] });
    }
    if (data.dueDate && data.dueDate < today) {
      ctx.addIssue({ code: "custom", message: "Due date can't be in the past", path: ["dueDate"] });
    }
    if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
      ctx.addIssue({ code: "custom", message: "Due date must be on or after the start date", path: ["dueDate"] });
    }
  });

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
