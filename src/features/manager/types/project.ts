export type ProjectPriority = "low" | "medium" | "high";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export type AssigneeType = "supervisor" | "employee";

export type Project = {
  id: string;
  name: string;
  description?: string;
  coverUri?: string;
  ownerId: string;
  memberIds: string[];
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  coverUri?: string;
  ownerId: string;
  members: string[];
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  initialTask?: {
    title: string;
    assigneeId: string;
    assigneeType: AssigneeType;
    priority: ProjectPriority;
    dueDate?: string;
  };
};
