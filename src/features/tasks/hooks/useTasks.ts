import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getManagerAssignedKpi,
  getMyKpiSummary,
  getTaskById,
  getTaskReminderSettings,
  listTaskComments,
  searchTasks,
} from "@/services/tasks.service";
import type { TaskSearchParams } from "@/features/tasks/types/task.types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskSearchParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
  reminderSettings: (id: string) =>
    [...taskKeys.detail(id), "reminder-settings"] as const,
  myKpi: () => [...taskKeys.all, "me", "kpi"] as const,
  managerAssignedKpi: () => [...taskKeys.all, "me", "assigned-kpi"] as const,
};

export function useTasks(params: TaskSearchParams = {}, enabled = true) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => searchTasks(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => getTaskById(id as string),
    enabled: Boolean(id),
  });
}

export function useTaskComments(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.comments(id ?? ""),
    queryFn: () => listTaskComments(id as string),
    enabled: Boolean(id),
  });
}

export function useTaskReminderSettings(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.reminderSettings(id ?? ""),
    queryFn: () => getTaskReminderSettings(id as string),
    enabled: Boolean(id),
  });
}

export function useMyKpi() {
  return useQuery({
    queryKey: taskKeys.myKpi(),
    queryFn: getMyKpiSummary,
    staleTime: 60_000,
  });
}

export function useManagerAssignedKpi() {
  return useQuery({
    queryKey: taskKeys.managerAssignedKpi(),
    queryFn: getManagerAssignedKpi,
    staleTime: 60_000,
  });
}
