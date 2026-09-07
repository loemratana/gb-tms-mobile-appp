import { z } from "zod";

function isTodayOrFuture(value: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return value >= today;
}

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500, "Title must be at most 500 characters"),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  departmentId: z.string().uuid("Select a department"),
  assigneeId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(isTodayOrFuture, "Start date must be today or in the future")
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(isTodayOrFuture, "Due date must be today or in the future")
    .optional(),
  estimatedHours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
