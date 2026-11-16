import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { listTaskAttachments } from "@/services/attachments.service";
import {
  getManagerAssignedKpi,
  getTaskById,
  getTaskCounts,
  getTaskReminderSettings,
  listTaskComments,
  searchTasks,
} from "@/services/tasks.service";
import type { PageResponse, TaskResponse, TaskSearchParams } from "@/features/tasks/types/task.types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskSearchParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
  attachments: (id: string) => [...taskKeys.detail(id), "attachments"] as const,
  submissions: (id: string) => [...taskKeys.detail(id), "submissions"] as const,
  reminderSettings: (id: string) =>
    [...taskKeys.detail(id), "reminder-settings"] as const,
  /** Aggregates (dashboards). Grouped so one invalidation refreshes them all. */
  summaries: () => [...taskKeys.all, "summary"] as const,
  counts: (params: TaskSearchParams) => [...taskKeys.summaries(), "counts", params] as const,
  managerAssignedKpi: () => [...taskKeys.summaries(), "assigned-kpi"] as const,
};

/** A task was created/changed/deleted: refresh every list and every dashboard number. */
export function invalidateTaskListsAndSummaries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: taskKeys.summaries() });
}

/** Exact server-side task counts — use instead of counting a fetched page, which caps out. */
export function useTaskCounts(params: TaskSearchParams, enabled = true) {
  return useQuery({
    queryKey: taskKeys.counts(params),
    queryFn: () => getTaskCounts(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTasks(params: TaskSearchParams = {}, enabled = true) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => searchTasks(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The task as it appears in any already-loaded task list, if there is one. */
function findTaskInCachedLists(queryClient: QueryClient, id: string): TaskResponse | undefined {
  const pages = queryClient.getQueriesData<PageResponse<TaskResponse>>({ queryKey: taskKeys.lists() });
  for (const [, page] of pages) {
    const match = page?.content.find((task) => task.id === id);
    if (match) return match;
  }
  return undefined;
}

export function useTask(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => getTaskById(id as string),
    enabled: Boolean(id),
    // Opening a task from a list: show the list's copy at once instead of a
    // skeleton, while the full task loads in the background.
    placeholderData: () => (id ? findTaskInCachedLists(queryClient, id) : undefined),
  });
}

/** How often an open comment thread checks for new messages from the other people on the task. */
const COMMENT_POLL_MS = 15_000;

export function useTaskComments(id: string | undefined, pollMs: number = COMMENT_POLL_MS) {
  return useQuery({
    queryKey: taskKeys.comments(id ?? ""),
    queryFn: () => listTaskComments(id as string),
    enabled: Boolean(id),
    // No push channel for comments yet, so poll while the screen is open (paused in the background).
    refetchInterval: pollMs,
    refetchIntervalInBackground: false,
  });
}

export function useTaskAttachments(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.attachments(id ?? ""),
    queryFn: () => listTaskAttachments(id as string),
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

export function useManagerAssignedKpi() {
  return useQuery({
    queryKey: taskKeys.managerAssignedKpi(),
    queryFn: getManagerAssignedKpi,
    staleTime: 60_000,
  });
}
