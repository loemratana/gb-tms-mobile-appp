import { useMemo, useState } from "react";

import { isSubtask } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";
import { useTaskContext } from "@/hooks/useTaskContext";
import {
  filterProjectTasks,
  getProjectTaskProgress,
  sortProjectTasks,
  type ProjectTaskFilter,
  type ProjectTaskSort,
} from "@/features/manager/utils/projectTasks";

export function useProjectTaskList(projectName: string | undefined) {
  // Shared task state — reused as-is from Context, not copied into local state.
  const { tasks: allTasks, loading, error, addTask, completeTask, deleteTask, clearError } =
    useTaskContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectTaskFilter>("all");
  const [sort, setSort] = useState<ProjectTaskSort>("recent");

  const tasks = useMemo<Task[]>(
    () =>
      projectName
        ? allTasks.filter((task) => task.project === projectName && !isSubtask(task))
        : [],
    [allTasks, projectName],
  );

  const filteredTasks = useMemo(
    () => sortProjectTasks(filterProjectTasks(tasks, { search, filter }), sort),
    [tasks, search, filter, sort],
  );

  const { completedCount, progress } = useMemo(() => getProjectTaskProgress(tasks), [tasks]);

  return {
    tasks,
    filteredTasks,
    completedCount,
    progress,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    addTask,
    completeTask,
    deleteTask,
    clearError,
  };
}
