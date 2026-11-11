import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabIconConfig = {
  label: string;
  /** Outline glyph for the resting tab. */
  icon: IoniconName;
  /** Filled glyph for the selected tab. */
  activeIcon: IoniconName;
};

const DASHBOARD_TAB: TabIconConfig = { label: "Dashboard", icon: "grid-outline", activeIcon: "grid" };
const TASKS_TAB: TabIconConfig = { label: "Tasks", icon: "checkbox-outline", activeIcon: "checkbox" };
const MEETINGS_TAB: TabIconConfig = { label: "Meetings", icon: "people-outline", activeIcon: "people" };
const CALENDAR_TAB: TabIconConfig = { label: "Calendar", icon: "calendar-outline", activeIcon: "calendar" };
const PROFILE_TAB: TabIconConfig = { label: "Profile", icon: "person-outline", activeIcon: "person" };

export const MANAGER_TAB_ICONS = {
  dashboard: DASHBOARD_TAB,
  tasks: TASKS_TAB,
  meetings: MEETINGS_TAB,
  calendar: CALENDAR_TAB,
  profile: PROFILE_TAB,
} as const satisfies Record<string, TabIconConfig>;

export type ManagerTabName = keyof typeof MANAGER_TAB_ICONS;

export const EMPLOYEE_TAB_ICONS = {
  dashboard: DASHBOARD_TAB,
  "my-tasks": TASKS_TAB,
  meetings: MEETINGS_TAB,
  calendar: CALENDAR_TAB,
  profile: PROFILE_TAB,
} as const satisfies Record<string, TabIconConfig>;

export type EmployeeTabName = keyof typeof EMPLOYEE_TAB_ICONS;
