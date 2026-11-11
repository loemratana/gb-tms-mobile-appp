import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  getDirectReports,
  getUserById,
  getUserHierarchy,
  getUserManager,
  getUserPerformance,
  searchUsers,
} from "@/services/users.service";
import type { UserPerformanceParams, UserSearchParams } from "@/features/users/types/user.types";
import { useAuthStore } from "@/stores/authStore";

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
  performance: (id: string, params: UserPerformanceParams) =>
    [...userKeys.detail(id), "performance", params] as const,
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
    queryFn: async () => {
      const me = await getCurrentUser();
      // Keep the session's role in step with the server (e.g. after a promotion or demotion).
      useAuthStore.getState().syncFromProfile(me);
      return me;
    },
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

export function useUserPerformance(id: string | undefined, params: UserPerformanceParams = {}) {
  return useQuery({
    queryKey: userKeys.performance(id ?? "", params),
    queryFn: () => getUserPerformance(id as string, params),
    enabled: Boolean(id),
    // Keep the previous period's numbers on screen while a new period loads.
    placeholderData: keepPreviousData,
  });
}
