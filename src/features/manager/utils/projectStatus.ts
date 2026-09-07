import type { ProjectStatus } from "@/features/manager/types/project";

export type ProjectStatusStyle = {
  bg: string;
  text: string;
  label: string;
};

const PROJECT_STATUS_STYLES: Record<ProjectStatus, ProjectStatusStyle> = {
  active: { bg: "#ECFDF5", text: "#16A34A", label: "Active" },
  planning: { bg: "#EFF6FF", text: "#2563EB", label: "Planning" },
  on_hold: { bg: "#FEF3C7", text: "#B45309", label: "On Hold" },
  completed: { bg: "#F3F4F6", text: "#6B7280", label: "Completed" },
};

export function getProjectStatusStyle(status: ProjectStatus): ProjectStatusStyle {
  return PROJECT_STATUS_STYLES[status];
}
