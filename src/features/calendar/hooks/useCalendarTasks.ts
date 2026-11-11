import { useMemo } from "react";

import { canAccessManagerArea } from "@/features/auth/utils/navigation";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskResponse, TaskSearchParams } from "@/features/tasks/types/task.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useAuthStore } from "@/stores/authStore";

/** Calendar has no server-side date-range filter, so pull a generous page and group client-side. */
const CALENDAR_TASKS_PAGE_SIZE = 200;

type CalendarTasks = {
  tasks: TaskResponse[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * Tasks with a due date for the calendar. Managers see every task the API lets
 * them see; employees see only tasks assigned to them.
 */
export function useCalendarTasks(): CalendarTasks {
  const role = useAuthStore((state) => state.user?.role);
  const isManagerView = role ? canAccessManagerArea(role) : false;
  const { data: currentUser } = useCurrentUser();

  const params: TaskSearchParams = isManagerView
    ? { size: CALENDAR_TASKS_PAGE_SIZE, sort: "dueDate,asc" }
    : { assigneeId: currentUser?.id, size: CALENDAR_TASKS_PAGE_SIZE, sort: "dueDate,asc" };
  const isEnabled = isManagerView || Boolean(currentUser?.id);

  const { data, isLoading, isError, refetch } = useTasks(params, isEnabled);
  useRefetchOnFocus(refetch);

  const tasks = useMemo(
    () => (data?.content ?? []).filter((task) => task.dueDate),
    [data],
  );

  return {
    tasks,
    // A disabled query (employee profile still loading) isn't "loading" to React Query.
    isLoading: isLoading || !isEnabled,
    isError,
    refetch: () => void refetch(),
  };
}
