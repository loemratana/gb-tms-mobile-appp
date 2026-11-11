import type { TeamRosterMember } from "@/features/team/types/team.types";

/** The fields every roster source (department members, direct reports) has in common. */
type RosterSource = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl: string | null;
  position: { name: string } | null;
};

export function toRosterMember(user: RosterSource, managerId: string | undefined): TeamRosterMember {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber ?? null,
    role: user.position?.name ?? "Team member",
    avatarUrl: user.avatarUrl,
    isManager: user.id === managerId,
  };
}

/** Manager first, then everyone else alphabetically. */
export function sortRoster(members: TeamRosterMember[]): TeamRosterMember[] {
  return [...members].sort((a, b) => {
    if (a.isManager !== b.isManager) return a.isManager ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Case-insensitive match on name, role or phone number. */
export function filterRoster(members: TeamRosterMember[], query: string): TeamRosterMember[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return members;
  return members.filter(
    (member) =>
      member.name.toLowerCase().includes(needle) ||
      member.role.toLowerCase().includes(needle) ||
      (member.phoneNumber?.includes(needle) ?? false),
  );
}
