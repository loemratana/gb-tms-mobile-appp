import { useMemo } from "react";

import { useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import type { UserResponse } from "@/features/users/types/user.types";
import { useCurrentUser, useDirectReports, useUsers } from "@/features/users/hooks/useUsers";

/**
 * Who the current user may hand tasks to, mirroring the server's assign scopes:
 * - "all": tasks:assign:all (admins) → every active user
 * - "department": tasks:assign:department → active members of their department
 * - "team": tasks:assign:team (managers) → their direct reports
 */
export type AssignScope = "all" | "department" | "team";

/** The server's max page size; enough to list every user in one request. */
const ALL_USERS_PAGE_SIZE = 1000;

export function resolveAssignScope(user: UserResponse | undefined | null): AssignScope | undefined {
  if (!user) return undefined;
  const permissions = user.permissions;
  if (permissions) {
    if (permissions.includes("tasks:assign:all")) return "all";
    if (permissions.includes("tasks:assign:department")) return "department";
    return "team";
  }
  // Older API versions don't send permissions: fall back to the default role scopes.
  const roleNames = [...(user.roles ?? []), ...(user.role ? [user.role] : [])].map((role) =>
    role.name.toUpperCase(),
  );
  return roleNames.includes("ADMIN") ? "all" : "team";
}

type AssignableUsers = {
  scope: AssignScope | undefined;
  options: AssigneeOption[];
  isLoading: boolean;
  isError: boolean;
};

/**
 * People the current user can assign. Only the query for their scope runs. The current user is
 * left out: a task is given to others (an admin can still be assigned by someone else).
 *
 * @param enabled skip all requests (e.g. on screens where the viewer can't assign).
 */
export function useAssignableUsers(enabled = true): AssignableUsers {
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useCurrentUser();
  const scope = enabled ? resolveAssignScope(me) : undefined;

  const allUsers = useAllActiveUsers(scope === "all");
  const departmentMembers = useDepartmentMembers(scope === "department" ? me?.department?.id : undefined);
  const directReports = useDirectReports(scope === "team" ? me?.id : undefined);

  const options = useMemo<AssigneeOption[]>(() => {
    let people: { id: string; fullName: string; avatarUrl: string | null; active?: boolean }[] = [];
    if (scope === "all") people = allUsers.data?.content ?? [];
    if (scope === "department") people = departmentMembers.data ?? [];
    if (scope === "team") people = directReports.data ?? [];
    return people
      .filter((person) => person.active !== false && person.id !== me?.id)
      .map((person) => ({ id: person.id, name: person.fullName, avatar: person.avatarUrl ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scope, allUsers.data, departmentMembers.data, directReports.data, me?.id]);

  const active =
    scope === "all" ? allUsers : scope === "department" ? departmentMembers : directReports;

  return {
    scope,
    options,
    isLoading: enabled && (isMeLoading || (Boolean(scope) && active.isLoading)),
    isError: enabled && (isMeError || (Boolean(scope) && active.isError)),
  };
}

function useAllActiveUsers(enabled: boolean) {
  return useUsers({ active: true, size: ALL_USERS_PAGE_SIZE, sort: "fullName,asc" }, enabled);
}
