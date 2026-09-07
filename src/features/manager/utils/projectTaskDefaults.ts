import type { Project } from "@/features/manager/types/project";

export type ProjectTaskCreateFormValues = {
  title: string;
  description: string;
  assigneeId: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
};

/** Fills in the project-scoped defaults a bare task-creation form doesn't collect. */
export function buildProjectTaskCreateInput(
  project: Pick<Project, "name" | "startDate" | "endDate">,
  values: ProjectTaskCreateFormValues,
  assigneeName: string,
) {
  return {
    title: values.title,
    description: values.description || `Task for ${project.name}`,
    assigneeName,
    priority: values.priority,
    scheduleType: "date" as const,
    startDate: project.startDate,
    endDate: values.dueDate ?? project.endDate ?? project.startDate,
    projectName: project.name,
  };
}
