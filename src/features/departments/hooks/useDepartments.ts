import { useQuery } from "@tanstack/react-query";

import {
  getDepartmentById,
  getDepartmentMembers,
  getDepartmentTree,
  listDepartments,
} from "@/services/departments.service";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  // Nested under lists() so the department mutations that invalidate lists() also refresh the tree.
  tree: () => [...departmentKeys.lists(), "tree"] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  members: (id: string) => [...departmentKeys.detail(id), "members"] as const,
};

export function useDepartments(enabled = true) {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: listDepartments,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useDepartmentTree(enabled = true) {
  return useQuery({
    queryKey: departmentKeys.tree(),
    queryFn: getDepartmentTree,
    // Shorter than the list: membership also changes through user edits, which don't invalidate this key.
    staleTime: 60_000,
    enabled,
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: departmentKeys.detail(id ?? ""),
    queryFn: () => getDepartmentById(id as string),
    enabled: Boolean(id),
  });
}

export function useDepartmentMembers(id: string | undefined) {
  return useQuery({
    queryKey: departmentKeys.members(id ?? ""),
    queryFn: () => getDepartmentMembers(id as string),
    enabled: Boolean(id),
  });
}
