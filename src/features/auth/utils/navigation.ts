import type { Href } from "expo-router";

import type { UserRole } from "@/features/auth/types/auth.types";

/** No admin area exists in the mobile app; admins get the manager experience. */
export function canAccessManagerArea(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function getDashboardPathForRole(role: UserRole): Href {
  return canAccessManagerArea(role)
    ? "/(manager)/(tabs)/dashboard"
    : "/(employee)/(tabs)/dashboard";
}

export function getTaskDetailPathForRole(role: UserRole, taskId: string): Href {
  return canAccessManagerArea(role)
    ? `/(manager)/tasks/${taskId}`
    : `/(employee)/tasks/${taskId}`;
}

/** Full-screen comment thread of a task; `focus` opens it with the message box ready to type in. */
export function getTaskCommentsPathForRole(
  role: UserRole,
  taskId: string,
  options: { focus?: boolean } = {},
): Href {
  const area = canAccessManagerArea(role) ? "(manager)" : "(employee)";
  return `/${area}/task-comments/${taskId}${options.focus ? "?focus=1" : ""}` as Href;
}

/** Full-screen Submit Work form for a task. */
export function getSubmitWorkPathForRole(role: UserRole, taskId: string): Href {
  const area = canAccessManagerArea(role) ? "(manager)" : "(employee)";
  return `/${area}/submit-work/${taskId}` as Href;
}

export function formatRoleLabel(role: UserRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function getTeamMemberPathForRole(role: UserRole, memberId: string): Href {
  return canAccessManagerArea(role)
    ? `/(manager)/team/${memberId}`
    : `/(employee)/team/${memberId}`;
}

export function getSettingsPathForRole(role: UserRole): Href {
  return canAccessManagerArea(role) ? "/(manager)/settings" : "/(employee)/settings";
}

export function getTeamPathForRole(role: UserRole): Href {
  return canAccessManagerArea(role) ? "/(manager)/team" : "/(employee)/team";
}

export function getMeetingDetailPathForRole(role: UserRole, bookingId: string): Href {
  return canAccessManagerArea(role)
    ? `/(manager)/meetings/${bookingId}`
    : `/(employee)/meetings/${bookingId}`;
}

/** New meeting form, optionally pre-filled (room from the Rooms list, day from the schedule, or an existing booking to edit). */
export function getMeetingFormPathForRole(
  role: UserRole,
  params: { roomId?: string; date?: string; bookingId?: string } = {},
): Href {
  const pathname = canAccessManagerArea(role) ? "/(manager)/meetings/new" : "/(employee)/meetings/new";
  return { pathname, params };
}

/** Room administration lives in the manager area, which admins use. */
export function getRoomManagementPath(): Href {
  return "/(manager)/rooms";
}

/** Room editor; `roomId` "new" opens an empty form. */
export function getRoomEditorPath(roomId: string | "new"): Href {
  return { pathname: "/(manager)/rooms/[id]", params: { id: roomId } };
}

/** QR scanner for attendees to check in to a meeting. */
export function getMeetingScanPath(role: UserRole): Href {
  return canAccessManagerArea(role) ? "/(manager)/meetings/scan" : "/(employee)/meetings/scan";
}

/** Organizer's rotating check-in QR code for a meeting. */
export function getMeetingCheckInCodePath(role: UserRole, bookingId: string): Href {
  const pathname = canAccessManagerArea(role) ? "/(manager)/meetings/check-in-code" : "/(employee)/meetings/check-in-code";
  return { pathname, params: { id: bookingId } };
}
