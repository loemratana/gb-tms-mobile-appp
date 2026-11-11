import type { Priority } from "@/features/tasks/types/task.types";

export const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: "LOW", label: "Low" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HIGH", label: "High" },
  { id: "URGENT", label: "Urgent" },
];
