import { useMemo } from "react";

import { useTeamRoster, type RosterMember } from "@/features/manager/hooks/useTeamRoster";
import type { Project } from "@/features/manager/types/project";

/**
 * Joins a project's `memberIds` against the current user's department roster
 * (there is no project-scoped members endpoint yet, so this is the closest
 * real "who could be on this project" set — same definition of "my team"
 * used elsewhere in the app).
 */
export function useProjectMembers(project: Pick<Project, "memberIds"> | undefined) {
  const { members: roster, isLoading, isError } = useTeamRoster();

  const memberMap = useMemo(
    () => new Map(roster.map((member) => [member.id, member])),
    [roster],
  );

  const assigneeMap = useMemo(
    () => new Map([...memberMap].map(([id, member]) => [id, member.name])),
    [memberMap],
  );

  const members = useMemo<RosterMember[]>(
    () =>
      (project?.memberIds ?? [])
        .map((memberId) => memberMap.get(memberId))
        .filter((member): member is RosterMember => Boolean(member)),
    [memberMap, project?.memberIds],
  );

  return { members, memberMap, assigneeMap, isLoading, isError };
}
