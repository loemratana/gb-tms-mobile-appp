import type { UserResponse } from "@/features/users/types/user.types";

export type ProfileUser = {
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  email: string;
};

function fallbackAvatar(seed: string): string {
  return `https://i.pravatar.cc/200?u=${encodeURIComponent(seed)}`;
}

/** "MANAGER" / "team_lead" -> "Manager" / "Team Lead", for any role name the backend returns. */
function formatRoleName(name: string): string {
  return name
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Maps GET /users/me onto the shape the profile UI renders. */
export function toProfileUser(user: UserResponse): ProfileUser {
  return {
    name: user.fullName,
    role: user.role?.name ? formatRoleName(user.role.name) : "",
    department: user.department?.name ?? "",
    avatarUrl: user.avatarUrl || fallbackAvatar(user.id),
    email: user.email,
  };
}

export type ProductivityStat = {
  id: string;
  label: string;
  value: string;
  icon:
    | "checkmark-done-outline"
    | "folder-outline"
    | "star-outline"
    | "people-outline";
};

export type WorkspaceInfo = {
  currentProject: string;
  team: string;
  position: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "completed" | "commented" | "updated";
};

export type SettingsItem = {
  id: string;
  label: string;
  icon:
    | "person-outline"
    | "notifications-outline"
    | "color-palette-outline"
    | "shield-checkmark-outline"
    | "log-out-outline";
  danger?: boolean;
};

export const defaultProfileUser: ProfileUser = {
  name: "",
  role: "",
  department: "",
  avatarUrl: fallbackAvatar("guest"),
  email: "",
};

/**
 * Fallback values shown before the real KPI query resolves. `completed` and
 * `kpi` are overwritten with live data from GET /tasks/me/kpi in
 * ProfileScreen — there is no backend concept of a "Score" or "Rank"
 * (KpiReview is an unused/disabled entity), so those cards were dropped.
 */
export const productivityStats: ProductivityStat[] = [
  {
    id: "completed",
    label: "Tasks",
    value: "0",
    icon: "checkmark-done-outline",
  },
  {
    id: "projects",
    label: "Projects",
    value: "6",
    icon: "folder-outline",
  },
  {
    id: "kpi",
    label: "KPI",
    value: "0%",
    icon: "star-outline",
  },
];

export const workspaceInfo: WorkspaceInfo = {
  currentProject: "TMS Mobile App",
  team: "Design Systems",
  position: "UI Engineer",
};

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Completed task",
    subtitle: "Design Review for Mobile App",
    time: "2h ago",
    type: "completed",
  },
  {
    id: "2",
    title: "Commented",
    subtitle: "On Backend API Integration",
    time: "5h ago",
    type: "commented",
  },
  {
    id: "3",
    title: "Updated project",
    subtitle: "TMS Mobile App roadmap",
    time: "Yesterday",
    type: "updated",
  },
];

export const settingsItems: SettingsItem[] = [
  { id: "edit", label: "Edit Profile", icon: "person-outline" },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "color-palette-outline",
  },
  {
    id: "security",
    label: "Security",
    icon: "shield-checkmark-outline",
  },
];
