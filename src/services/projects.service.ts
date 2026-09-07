import type { CreateProjectInput, Project } from "@/features/manager/types/project";

/** Simulated API: POST /projects */
export async function postProject(input: CreateProjectInput): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    id: `proj-${Date.now()}`,
    name: input.name,
    description: input.description,
    coverUri: input.coverUri,
    ownerId: input.ownerId,
    memberIds: input.members,
    priority: input.priority,
    status: input.status,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: new Date().toISOString(),
  };
}
