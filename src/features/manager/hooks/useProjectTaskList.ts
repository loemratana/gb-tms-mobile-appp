import { useMemo, useState } from "react";

import { isSubtask } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";
import {
  filterProjectTasks,
  getProjectTaskProgress,
  sortProjectTasks,
  type ProjectTaskFilter,
  type ProjectTaskSort,
} from "@/features/manager/utils/projectTasks";
import { useTasksStore } from "@/stores/tasksStore";

export function useProjectTaskList(projectName: string | undefined) {
  const allTasks = useTasksStore((s) => s.tasks);
  const createTask = useTasksStore((s) => s.createTask);
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
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    createTask,
  };
}
