import type { UserResponse } from "@/features/users/types/user.types";

export const MANAGER_ROLE_NAME = "MANAGER";

/** The API has sent both a single `role` and a `roles` set over time — accept either. */
export function getRoleNames(user: Pick<UserResponse, "role" | "roles">): string[] {
  const roles = user.roles ?? (user.role ? [user.role] : []);
  return roles.map((role) => role.name.toUpperCase());
}

export function hasRole(user: Pick<UserResponse, "role" | "roles">, roleName: string): boolean {
  return getRoleNames(user).includes(roleName.toUpperCase());
}

export function isManager(user: Pick<UserResponse, "role" | "roles">): boolean {
  return hasRole(user, MANAGER_ROLE_NAME);
}
