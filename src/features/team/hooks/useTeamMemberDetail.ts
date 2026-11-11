import { useMemo } from "react";

import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { Task } from "@/features/tasks/types/taskView.types";
import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import { useUser } from "@/features/users/hooks/useUsers";
import type { UserResponse } from "@/features/users/types/user.types";
import { isManager } from "@/features/users/utils/userRoles";

/** The member's tasks are fetched in one page; nobody carries more than this many at once. */
const MEMBER_TASKS_PAGE_SIZE = 200;

type TeamMemberDetail = {
  member: UserResponse | undefined;
  isMemberManager: boolean;
  isLoadingMember: boolean;
  isMemberError: boolean;
  refetchMember: () => void;
  tasks: Task[];
  isLoadingTasks: boolean;
};

/** One teammate's profile and their assigned tasks. Performance is loaded separately by PerformanceOverview. */
export function useTeamMemberDetail(id: string | undefined): TeamMemberDetail {
  const memberQuery = useUser(id);
  const tasksQuery = useTasks({ assigneeId: id, size: MEMBER_TASKS_PAGE_SIZE }, Boolean(id));

  const tasks = useMemo(
    () => (tasksQuery.data?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksQuery.data],
  );
  const member = memberQuery.data;

  return {
    member,
    isMemberManager: member ? isManager(member) : false,
    isLoadingMember: memberQuery.isLoading,
    isMemberError: memberQuery.isError,
    refetchMember: () => void memberQuery.refetch(),
    tasks,
    isLoadingTasks: tasksQuery.isLoading,
  };
}
