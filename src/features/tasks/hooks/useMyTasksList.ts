import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import { isSubtask, isTaskOverdue } from "@/features/tasks/utils/task.utils";
import type { StatusFilter, Task } from "@/features/tasks/types/taskView.types";
import {
  EMPTY_TASK_FILTERS,
  getActiveFilterChips,
  hasActiveTaskFilters,
  matchesTaskDateFilter,
  removeActiveFilterChip,
  type ActiveFilterChip,
  type TaskListFilters,
} from "@/features/tasks/utils/taskFilters";
import {
  STATUS_FILTERS,
  matchesTaskSearch,
  matchesTaskStatusFilter,
} from "@/features/tasks/utils/taskListFilters";
import { useChangeAnyTaskStatus } from "./useTaskMutations";
import { useTasks } from "./useTasks";
import type { TaskSearchParams } from "@/features/tasks/types/task.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { getApiErrorMessage } from "@/lib/api";

const SEARCH_DEBOUNCE_MS = 300;

export type TaskListSummary = {
  activeCount: number;
  overdueCount: number;
};

type MyTasksList = {
  currentUserId?: string;
  tasks: Task[];
  summary: TaskListSummary;
  statusCounts: Record<StatusFilter, number>;
  isLoading: boolean;
  isError: boolean;
  /** A background refetch (pull-to-refresh) is running; distinct from the first load. */
  isRefreshing: boolean;
  refetch: () => void;

  query: string;
  setQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  filters: TaskListFilters;
  setFilters: (filters: TaskListFilters) => void;
  activeFilterChips: ActiveFilterChip[];
  hasActiveFilters: boolean;
  removeFilterChip: (chipId: ActiveFilterChip["id"]) => void;
  clearAllFilters: () => void;

  confirmingTaskId: string | null;
  confirmTask: (task: Task) => Promise<void>;
};

/**
 * Data + filter state for the task list. `searchParams` overrides the default
 * "assigned to me" query, e.g. a manager scoping the list to tasks they assigned.
 */
export function useMyTasksList(searchParams?: TaskSearchParams): MyTasksList {
  const { data: currentUser } = useCurrentUser();

  // No pagination UI yet — filtering below is client-side, so pull a
  // generous page rather than build screen-specific paginated endpoints.
  const resolvedParams: TaskSearchParams = {
    ...(searchParams ?? { assigneeId: currentUser?.id }),
    size: 200,
  };
  const isQueryEnabled = searchParams
    ? Boolean(currentUser?.id) &&
      Object.values(searchParams).some((value) => value !== undefined)
    : Boolean(currentUser?.id);

  const {
    data: tasksPage,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useTasks(resolvedParams, isQueryEnabled);
  useRefetchOnFocus(refetch);

  // Subtasks render nested inside their parent, never as top-level rows.
  const topLevelTasks = useMemo(
    () =>
      (tasksPage?.content ?? [])
        .map(mapTaskResponseToEmployeeTask)
        .filter((task) => !isSubtask(task)),
    [tasksPage],
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<TaskListFilters>(EMPTY_TASK_FILTERS);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(query.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query]);

  // Search + date filters apply before the status tab, so each tab's count
  // reflects what the user would see after switching to it.
  const searchedTasks = useMemo(
    () =>
      topLevelTasks.filter(
        (task) =>
          matchesTaskDateFilter(task, filters) &&
          matchesTaskSearch(task, debouncedQuery),
      ),
    [topLevelTasks, filters, debouncedQuery],
  );

  const tasks = useMemo(
    () =>
      searchedTasks.filter((task) =>
        matchesTaskStatusFilter(task, statusFilter),
      ),
    [searchedTasks, statusFilter],
  );

  const statusCounts = useMemo(() => {
    const counts = {} as Record<StatusFilter, number>;
    for (const status of STATUS_FILTERS) {
      counts[status] = searchedTasks.filter((task) =>
        matchesTaskStatusFilter(task, status),
      ).length;
    }
    return counts;
  }, [searchedTasks]);

  const summary = useMemo<TaskListSummary>(
    () => ({
      activeCount: topLevelTasks.filter(
        (task) => task.status !== "done" && task.status !== "cancelled",
      ).length,
      overdueCount: topLevelTasks.filter(isTaskOverdue).length,
    }),
    [topLevelTasks],
  );

  const activeFilterChips = useMemo(
    () => getActiveFilterChips(filters),
    [filters],
  );

  const removeFilterChip = useCallback((chipId: ActiveFilterChip["id"]) => {
    setFilters((previous) => removeActiveFilterChip(previous, chipId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_TASK_FILTERS);
  }, []);

  const changeStatusMutation = useChangeAnyTaskStatus();
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);

  const confirmTask = useCallback(
    async (task: Task) => {
      setConfirmingTaskId(task.id);
      try {
        await changeStatusMutation.mutateAsync({
          id: task.id,
          status: "IN_PROGRESS",
        });
      } catch (error) {
        // Show the server's reason (e.g. the task was cancelled meanwhile), not a generic retry hint.
        Alert.alert("Couldn't confirm task", getApiErrorMessage(error));
      } finally {
        setConfirmingTaskId(null);
      }
    },
    [changeStatusMutation],
  );

  return {
    currentUserId: currentUser?.id,
    tasks,
    summary,
    statusCounts,
    isLoading,
    isError,
    isRefreshing: isRefetching && !isLoading,
    refetch: () => void refetch(),

    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    filters,
    setFilters,
    activeFilterChips,
    hasActiveFilters: hasActiveTaskFilters(filters),
    removeFilterChip,
    clearAllFilters,

    confirmingTaskId,
    confirmTask,
  };
}
