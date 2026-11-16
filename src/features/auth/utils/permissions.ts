import type { UserResponse } from "@/features/users/types/user.types";

/** Any of these lets a user hand tasks to others (mirrors the backend's assign endpoints). */
const TASK_ASSIGN_PERMISSIONS = [
  "tasks:assign:all",
  "tasks:assign:department",
  "tasks:assign:team",
] as const;

const ASSIGNING_ROLES = new Set(["ADMIN", "MANAGER"]);

/**
 * True when the user can delete (archive) tasks. Older API versions don't send `permissions`;
 * then fall back to the roles that hold `tasks:delete` by default.
 */
export function canDeleteTasks(user: UserResponse | undefined | null): boolean {
  if (!user) {
    return false;
  }
  if (user.permissions) {
    return user.permissions.includes("tasks:delete");
  }
  const roleNames = [...(user.roles ?? []), ...(user.role ? [user.role] : [])];
  return roleNames.some((role) => ASSIGNING_ROLES.has(role.name.toUpperCase()));
}

/**
 * True when the user can assign tasks to others: an ADMIN/MANAGER role, or any
 * `tasks:assign:*` permission (e.g. an employee promoted to team lead).
 */
export function canAssignTasks(user: UserResponse | undefined | null): boolean {
  if (!user) {
    return false;
  }

  const roleNames = [...(user.roles ?? []), ...(user.role ? [user.role] : [])];
  if (roleNames.some((role) => ASSIGNING_ROLES.has(role.name.toUpperCase()))) {
    return true;
  }

  const permissions = new Set(user.permissions ?? []);
  return TASK_ASSIGN_PERMISSIONS.some((permission) => permissions.has(permission));
}

/**
 * True when `viewer` may open `targetUserId`'s detailed performance (GET /users/{id}/performance):
 * their own, or anyone's with `users:view` — the server's rule. Teammates' star ratings
 * (the leaderboard) are open to everyone and don't need this.
 * Older API versions don't send `permissions`; then fall back to ADMIN/MANAGER.
 */
export function canViewUserPerformance(
  viewer: UserResponse | undefined | null,
  targetUserId: string | undefined,
): boolean {
  if (!viewer || !targetUserId) {
    return false;
  }
  if (viewer.id === targetUserId) {
    return true;
  }
  if (viewer.permissions) {
    return viewer.permissions.includes("users:view");
  }
  const roleNames = [...(viewer.roles ?? []), ...(viewer.role ? [viewer.role] : [])];
  return roleNames.some((role) => ASSIGNING_ROLES.has(role.name.toUpperCase()));
}

/**
 * True when the user can book meeting rooms (`bookings:create`). Who they may invite is
 * checked by the server (bookings:invite:* scopes), which rejects out-of-scope targets.
 * Older API versions don't send `permissions`; then fall back to ADMIN/MANAGER.
 */
export function canBookRooms(user: UserResponse | undefined | null): boolean {
  if (!user) {
    return false;
  }
  if (user.permissions) {
    return user.permissions.includes("bookings:create");
  }
  const roleNames = [...(user.roles ?? []), ...(user.role ? [user.role] : [])];
  return roleNames.some((role) => ASSIGNING_ROLES.has(role.name.toUpperCase()));
}

/** True when the user can create and edit meeting rooms (`rooms:manage`, admins by default). */
export function canManageRooms(user: UserResponse | undefined | null): boolean {
  if (!user) {
    return false;
  }
  if (user.permissions) {
    return user.permissions.includes("rooms:manage");
  }
  const roleNames = [...(user.roles ?? []), ...(user.role ? [user.role] : [])];
  return roleNames.some((role) => role.name.toUpperCase() === "ADMIN");
}
