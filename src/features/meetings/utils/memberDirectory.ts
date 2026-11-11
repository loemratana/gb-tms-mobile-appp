import type { DepartmentTreeNode } from "@/features/departments/types/department.types";
import type { BookingResponse, BookingTargets } from "@/features/meetings/types/meeting.types";

export type DirectoryDepartment = { id: string; name: string; memberCount: number };
export type DirectoryPosition = {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  memberCount: number;
};
export type DirectoryPerson = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  departmentName: string;
  positionName: string | null;
};

export type MemberDirectory = {
  departments: DirectoryDepartment[];
  positions: DirectoryPosition[];
  people: DirectoryPerson[];
};

export const EMPTY_TARGETS: BookingTargets = { departmentIds: [], positionIds: [], userIds: [] };

/** Flattens department → positions → members into the three lists the member picker shows. */
export function buildMemberDirectory(tree: DepartmentTreeNode[] | undefined): MemberDirectory {
  const departments: DirectoryDepartment[] = [];
  const positions: DirectoryPosition[] = [];
  const people: DirectoryPerson[] = [];

  for (const department of tree ?? []) {
    departments.push({ id: department.id, name: department.name, memberCount: department.memberCount });
    for (const position of department.positions) {
      positions.push({
        id: position.id,
        name: position.name,
        departmentId: department.id,
        departmentName: department.name,
        memberCount: position.members.length,
      });
      for (const member of position.members) {
        people.push({
          id: member.id,
          fullName: member.fullName,
          avatarUrl: member.avatarUrl,
          departmentName: department.name,
          positionName: position.name,
        });
      }
    }
    for (const member of department.unassignedMembers) {
      people.push({
        id: member.id,
        fullName: member.fullName,
        avatarUrl: member.avatarUrl,
        departmentName: department.name,
        positionName: null,
      });
    }
  }

  const byName = <T extends { name?: string; fullName?: string }>(a: T, b: T) =>
    (a.name ?? a.fullName ?? "").localeCompare(b.name ?? b.fullName ?? "");
  return {
    departments: departments.sort(byName),
    positions: positions.sort(byName),
    people: people.sort(byName),
  };
}

/** Case-insensitive match on any of the given fields. */
export function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

/** Targets of an existing booking, for editing it. The organizer is implicit, so it's left out. */
export function targetsOfBooking(booking: BookingResponse): BookingTargets {
  return {
    departmentIds: booking.targets.departments.map((department) => department.id),
    positionIds: booking.targets.positions.map((position) => position.id),
    userIds: booking.targets.users
      .map((user) => user.id)
      .filter((id) => id !== booking.organizer.id),
  };
}

export function countTargets(targets: BookingTargets): number {
  return targets.departmentIds.length + targets.positionIds.length + targets.userIds.length;
}
