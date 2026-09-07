import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  getDirectReports,
  getUserById,
  getUserHierarchy,
  getUserManager,
  searchUsers,
} from "@/services/users.service";
import type { UserSearchParams } from "@/features/users/types/user.types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserSearchParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
  manager: (id: string) => [...userKeys.detail(id), "manager"] as const,
  reports: (id: string) => [...userKeys.detail(id), "reports"] as const,
  hierarchy: (id: string) => [...userKeys.detail(id), "hierarchy"] as const,
};

export function useUsers(params: UserSearchParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => searchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => getUserById(id as string),
    enabled: Boolean(id),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60_000,
  });
}

export function useUserManager(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.manager(id ?? ""),
    queryFn: () => getUserManager(id as string),
    enabled: Boolean(id),
  });
}

/** Direct reports only — not recursive. Use useUserHierarchy for the full downline. */
export function useDirectReports(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.reports(id ?? ""),
    queryFn: () => getDirectReports(id as string),
    enabled: Boolean(id),
  });
}

export function useUserHierarchy(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.hierarchy(id ?? ""),
    queryFn: () => getUserHierarchy(id as string),
    enabled: Boolean(id),
  });
}
