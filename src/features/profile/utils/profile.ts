import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

import type { UserResponse } from "@/features/users/types/user.types";
import { getRoleNames } from "@/features/users/utils/userRoles";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type ProfileUser = {
  name: string;
  role: string;
  department: string;
  /** null when the user hasn't uploaded a photo — `Avatar` shows their initials. */
  avatarUrl: string | null;
  email: string;
};

/** "MANAGER" / "team_lead" -> "Manager" / "Team Lead", for any role name the backend returns. */
export function formatRoleName(name: string): string {
  return name
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Maps GET /users/me onto the shape the profile UI and header render. */
export function toProfileUser(user: UserResponse): ProfileUser {
  const [primaryRole] = getRoleNames(user);
  return {
    name: user.fullName,
    role: primaryRole ? formatRoleName(primaryRole) : "",
    department: user.department?.name ?? "",
    avatarUrl: user.avatarUrl || null,
    email: user.email,
  };
}

export const defaultProfileUser: ProfileUser = {
  name: "",
  role: "",
  department: "",
  avatarUrl: null,
  email: "",
};

export type ProfileDetail = {
  key: "email" | "phone" | "position" | "department" | "manager";
  label: string;
  value: string;
  icon: IconName;
};

/** Account details for the profile screen — only the fields this user actually has. */
export function toProfileDetails(user: UserResponse): ProfileDetail[] {
  const details: (ProfileDetail | null)[] = [
    { key: "email", label: "Email", value: user.email, icon: "mail-outline" },
    user.phoneNumber ? { key: "phone", label: "Phone", value: user.phoneNumber, icon: "call-outline" } : null,
    user.position ? { key: "position", label: "Position", value: user.position.name, icon: "briefcase-outline" } : null,
    user.department
      ? { key: "department", label: "Department", value: user.department.name, icon: "business-outline" }
      : null,
    user.manager ? { key: "manager", label: "Manager", value: user.manager.name, icon: "person-outline" } : null,
  ];
  return details.filter((detail): detail is ProfileDetail => detail !== null);
}
