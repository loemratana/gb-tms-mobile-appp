import { useMemo } from "react";

import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

/** The caller's own assigned tasks, mapped to the calendar's display model. */
export function useCalendarTasks() {
  const { data: currentUser } = useCurrentUser();

  const { data: tasksPage, isLoading, isError, refetch } = useTasks(
    { assigneeId: currentUser?.id, size: 200 },
    Boolean(currentUser?.id),
  );

  const tasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  return { tasks, isLoading, isError, refetch };
}
