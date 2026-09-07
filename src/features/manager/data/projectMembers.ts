import { teamMembers } from "@/features/employee/data/team";

export type MemberDepartment = "all" | "it" | "design" | "qa" | "research";

export const DEPARTMENTS: { key: MemberDepartment; label: string }[] = [
  { key: "all", label: "All" },
  { key: "it", label: "IT" },
  { key: "design", label: "Design" },
  { key: "qa", label: "QA" },
  { key: "research", label: "Research" },
];

export const ROLE_FILTERS = [
  { key: "all", label: "All roles" },
  { key: "engineer", label: "Engineers" },
  { key: "designer", label: "Designers" },
  { key: "qa", label: "QA" },
];

const DEPARTMENT_MAP: Record<string, MemberDepartment> = {
  m1: "it",
  m2: "design",
  m3: "it",
  m4: "qa",
  m5: "research",
  m6: "design",
  m7: "design",
};

export function getMemberDepartment(memberId: string): MemberDepartment {
  return DEPARTMENT_MAP[memberId] ?? "it";
}

export function filterMembersByDepartment(
  department: MemberDepartment,
  search: string,
  roleFilter: string
) {
  const query = search.trim().toLowerCase();

  return teamMembers.filter((member) => {
    const dept = getMemberDepartment(member.id);
    if (department !== "all" && dept !== department) return false;

    if (roleFilter !== "all") {
      const role = member.role.toLowerCase();
      if (roleFilter === "engineer" && !role.includes("engineer")) return false;
      if (roleFilter === "designer" && !role.includes("design")) return false;
      if (roleFilter === "qa" && !role.includes("qa")) return false;
    }

    if (!query) return true;
    return (
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    );
  });
}
