import { useMemo } from "react";

import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { Task } from "@/features/tasks/types/taskView.types";
import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import { toListRows } from "@/features/tasks/utils/task.utils";

/** Same page size as the My Tasks list, so both share one cached request. */
const MY_TASKS_PAGE_SIZE = 200;

type MyWorkTasks = {
  tasks: Task[];
  /** Tasks assigned to the user on the server, beyond the loaded page too. */
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * Tasks assigned to the current user, for the dashboard's "My work" section — the same rows as the
 * My Tasks list, so a subtask shown inside its parent's card isn't listed (and counted) twice.
 */
export function useMyWorkTasks(userId: string | undefined): MyWorkTasks {
  const { data, isLoading, isError, refetch } = useTasks(
    { assigneeId: userId, size: MY_TASKS_PAGE_SIZE },
    Boolean(userId),
  );
  const tasks = useMemo(() => toListRows((data?.content ?? []).map(mapTaskResponseToEmployeeTask)), [data]);

  return {
    tasks,
    total: data?.totalElements ?? 0,
    isLoading,
    isError,
    refetch: () => void refetch(),
  };
}
