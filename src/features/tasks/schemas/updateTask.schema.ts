import { z } from "zod";

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500, "Title must be at most 500 characters"),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
});

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

export const assignTaskSchema = z.object({
  assigneeId: z.string().uuid("Select an assignee"),
});

export type AssignTaskFormValues = z.infer<typeof assignTaskSchema>;
