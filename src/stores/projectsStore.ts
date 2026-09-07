import { create } from "zustand";

import type { CreateProjectInput, Project } from "@/features/manager/types/project";
import { postProject } from "@/services/projects.service";

type ProjectsState = {
  projects: Project[];
  isCreating: boolean;
  getProjectById: (id: string) => Project | undefined;
  createProject: (input: CreateProjectInput) => Promise<Project>;
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "TMS Mobile App",
    description: "Core mobile experience for task management",
    ownerId: "mgr-1",
    memberIds: ["m1", "m2", "m3"],
    priority: "high",
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "proj-2",
    name: "Growth Campaign",
    description: "Q2 marketing and onboarding improvements",
    ownerId: "mgr-1",
    memberIds: ["m5", "m7"],
    priority: "medium",
    status: "planning",
    startDate: "2026-04-01",
    endDate: "2026-08-15",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "proj-3",
    name: "Manager Analytics v2",
    description: "Upgrade KPI cards, charts, and weekly performance insights",
    ownerId: "mgr-1",
    memberIds: ["m1", "m3", "m4", "m6"],
    priority: "high",
    status: "active",
    startDate: "2026-05-08",
    endDate: "2026-09-12",
    createdAt: "2026-05-02T09:40:00.000Z",
  },
  {
    id: "proj-4",
    name: "Team Productivity Toolkit",
    description: "Build templates and automation for recurring team workflows",
    ownerId: "mgr-1",
    memberIds: ["m2", "m5", "m7"],
    priority: "medium",
    status: "planning",
    startDate: "2026-07-01",
    endDate: "2026-10-30",
    createdAt: "2026-06-19T14:20:00.000Z",
  },
  {
    id: "proj-5",
    name: "Client Onboarding Revamp",
    description: "Streamline setup flow and improve first-week activation",
    ownerId: "mgr-1",
    memberIds: ["m1", "m2", "m5"],
    priority: "high",
    status: "on_hold",
    startDate: "2026-02-15",
    endDate: "2026-07-20",
    createdAt: "2026-02-10T11:05:00.000Z",
  },
  {
    id: "proj-6",
    name: "Design System Refresh",
    description: "Unify spacing, typography, and component tokens across manager screens",
    ownerId: "mgr-1",
    memberIds: ["m2", "m6", "m7"],
    priority: "medium",
    status: "active",
    startDate: "2026-06-03",
    endDate: "2026-09-01",
    createdAt: "2026-05-29T08:15:00.000Z",
  },
  {
    id: "proj-7",
    name: "QA Stability Sprint",
    description: "Reduce regressions with stronger testing and release checks",
    ownerId: "mgr-1",
    memberIds: ["m3", "m4"],
    priority: "high",
    status: "active",
    startDate: "2026-06-20",
    endDate: "2026-08-25",
    createdAt: "2026-06-18T16:30:00.000Z",
  },
  {
    id: "proj-8",
    name: "Knowledge Base Migration",
    description: "Move team docs to a centralized workspace with better structure",
    ownerId: "mgr-1",
    memberIds: ["m1", "m5", "m7"],
    priority: "low",
    status: "completed",
    startDate: "2026-01-05",
    endDate: "2026-03-22",
    createdAt: "2025-12-29T07:45:00.000Z",
  },
];

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: INITIAL_PROJECTS,
  isCreating: false,
  getProjectById: (id) => get().projects.find((project) => project.id === id),

  createProject: async (input) => {
    set({ isCreating: true });

    const optimistic: Project = {
      id: `proj-temp-${Date.now()}`,
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

    set((state) => ({ projects: [optimistic, ...state.projects] }));

    try {
      const created = await postProject(input);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === optimistic.id ? created : p
        ),
        isCreating: false,
      }));
      return created;
    } catch (error) {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== optimistic.id),
        isCreating: false,
      }));
      throw error;
    }
  },
}));
