import { useMemo, useState } from "react";

import { useDepartment, useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import type { TeamRosterInfo, TeamRosterMember } from "@/features/team/types/team.types";
import { filterRoster, sortRoster, toRosterMember } from "@/features/team/utils/teamRoster";
import { useCurrentUser, useDirectReports } from "@/features/users/hooks/useUsers";

/**
 * "department": everyone in the viewer's department (employees).
 * "directReports": only users who report to the viewer — managers work on their direct
 * reports' tasks only, so listing the whole department would lead to members whose tasks
 * they can't see.
 */
export type TeamScope = "department" | "directReports";

/** What the team screen should show instead of the roster, if anything. */
export type TeamRosterStatus =
  | "loading"
  | "profileError"
  | "noDepartment"
  | "teamError"
  | "noReports"
  | "ready";

type TeamRoster = {
  status: TeamRosterStatus;
  team: TeamRosterInfo;
  members: TeamRosterMember[];
  /** `members` narrowed by `query`. */
  visibleMembers: TeamRosterMember[];
  query: string;
  setQuery: (query: string) => void;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

export function useTeamRoster(scope: TeamScope = "department"): TeamRoster {
  const isReportsScope = scope === "directReports";
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const meQuery = useCurrentUser();
  const me = meQuery.data;
  const departmentId = me?.department?.id;

  const departmentQuery = useDepartment(departmentId);
  const membersQuery = useDepartmentMembers(isReportsScope ? undefined : departmentId);
  const reportsQuery = useDirectReports(isReportsScope ? me?.id : undefined);
  const rosterQuery = isReportsScope ? reportsQuery : membersQuery;
  const department = departmentQuery.data;
  const managerId = department?.manager?.id;

  const members = useMemo(() => {
    const roster = isReportsScope
      ? (reportsQuery.data ?? []).filter((member) => member.active).map((member) => toRosterMember(member, undefined))
      : (membersQuery.data ?? []).map((member) => toRosterMember(member, managerId));
    return sortRoster(roster);
  }, [isReportsScope, reportsQuery.data, membersQuery.data, managerId]);

  const visibleMembers = useMemo(() => filterRoster(members, query), [members, query]);

  const team: TeamRosterInfo = isReportsScope
    ? {
        kind: "directReports",
        title: "Reporting to you",
        description: department?.name ? `In ${department.name}` : null,
        memberCount: members.length,
        leadName: me?.fullName ?? "You",
        leadAvatarUrl: me?.avatarUrl ?? null,
        isLeadYou: true,
      }
    : {
        kind: "department",
        title: department?.name ?? "Your team",
        description: department?.description ?? null,
        memberCount: members.length,
        leadName: department?.manager?.name ?? "Not assigned",
        leadAvatarUrl: members.find((member) => member.isManager)?.avatarUrl ?? null,
        isLeadYou: Boolean(managerId && managerId === me?.id),
      };

  let status: TeamRosterStatus = "ready";
  if (meQuery.isLoading) status = "loading";
  else if (meQuery.isError) status = "profileError";
  else if (!isReportsScope && !departmentId) status = "noDepartment";
  else if (rosterQuery.isLoading || (departmentId && departmentQuery.isLoading)) status = "loading";
  else if (rosterQuery.isError || departmentQuery.isError) status = "teamError";
  else if (isReportsScope && members.length === 0) status = "noReports";

  // /users/me is cached for minutes, so refresh it too — a newly assigned department only shows up after that.
  const refetchAll = async () => {
    const { data: freshMe } = await meQuery.refetch();
    const refetches: Promise<unknown>[] = [];
    if (freshMe?.department?.id) refetches.push(departmentQuery.refetch());
    if (isReportsScope ? freshMe?.id : freshMe?.department?.id) refetches.push(rosterQuery.refetch());
    await Promise.all(refetches);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  return { status, team, members, visibleMembers, query, setQuery, isRefreshing, refresh };
}
