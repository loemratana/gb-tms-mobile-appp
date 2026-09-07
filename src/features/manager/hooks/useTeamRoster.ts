import { useMemo } from "react";

import { useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

export type RosterMember = {
  id: string;
  name: string;
  avatarUrl: string;
};

/** Matches the fallback convention used across TeamScreen / CreateTaskBottomSheet. */
function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
}

/**
 * Real assignee roster for project/task pickers — the current user's department
 * members, same "my team" definition already used by TeamScreen and
 * CreateTaskBottomSheet. Replaces the old hardcoded mock roster
 * (features/employee/data/team.ts) for the manager project-task flows.
 */
export function useTeamRoster() {
  const { data: currentUser, isLoading: isLoadingMe } = useCurrentUser();
  const departmentId = currentUser?.department?.id;

  const {
    data: departmentMembers,
    isLoading: isLoadingMembers,
    isError,
  } = useDepartmentMembers(departmentId);

  const members = useMemo<RosterMember[]>(
    () =>
      (departmentMembers ?? []).map((member) => ({
        id: member.id,
        name: member.fullName,
        avatarUrl: member.avatarUrl ?? fallbackAvatar(member.fullName),
      })),
    [departmentMembers],
  );

  return {
    members,
    isLoading: isLoadingMe || isLoadingMembers,
    isError,
    hasDepartment: Boolean(departmentId),
  };
}
