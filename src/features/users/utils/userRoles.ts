import type { UserResponse } from "@/features/users/types/user.types";

export const MANAGER_ROLE_NAME = "MANAGER";

export function hasRole(user: Pick<UserResponse, "role">, roleName: string): boolean {
  return user.role?.name === roleName;
}

export function isManager(user: Pick<UserResponse, "role">): boolean {
  return hasRole(user, MANAGER_ROLE_NAME);
}
