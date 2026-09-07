import type { SFSymbol } from "sf-symbols-typescript";

export type TabSfIconConfig = {
  label: string;
  sf: SFSymbol | { default: SFSymbol; selected: SFSymbol };
  android: string | { default: string; selected: string };
};

export const MANAGER_TAB_ICONS = {
  dashboard: {
    label: "Dashboard",
    sf: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
    android: { default: "view-dashboard-outline", selected: "view-dashboard" },
  },
  tasks: {
    label: "Tasks",
    sf: { default: "checkmark.square", selected: "checkmark.square.fill" },
    android: { default: "clipboard-check-outline", selected: "clipboard-check" },
  },
  team: {
    label: "Team",
    sf: { default: "person.2", selected: "person.2.fill" },
    android: { default: "account-multiple-outline", selected: "account-multiple" },
  },
  calendar: {
    label: "Calendar",
    sf: "calendar",
    android: { default: "calendar-month-outline", selected: "calendar-month" },
  },
  profile: {
    label: "Profile",
    sf: { default: "person.crop.circle", selected: "person.crop.circle.fill" },
    android: { default: "account-circle-outline", selected: "account-circle" },
  },
} as const satisfies Record<string, TabSfIconConfig>;

export type ManagerTabName = keyof typeof MANAGER_TAB_ICONS;

export const EMPLOYEE_TAB_ICONS = {
  dashboard: {
    label: "Dashboard",
    sf: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
    android: { default: "view-dashboard-outline", selected: "view-dashboard" },
  },
  "my-tasks": {
    label: "Tasks",
    sf: { default: "checkmark.square", selected: "checkmark.square.fill" },
    android: { default: "clipboard-check-outline", selected: "clipboard-check" },
  },
  team: {
    label: "Team",
    sf: { default: "person.2", selected: "person.2.fill" },
    android: { default: "account-multiple-outline", selected: "account-multiple" },
  },
  calendar: {
    label: "Calendar",
    sf: "calendar",
    android: { default: "calendar-month-outline", selected: "calendar-month" },
  },
  profile: {
    label: "Profile",
    sf: { default: "person.crop.circle", selected: "person.crop.circle.fill" },
    android: { default: "account-circle-outline", selected: "account-circle" },
  },
} as const satisfies Record<string, TabSfIconConfig>;

export type EmployeeTabName = keyof typeof EMPLOYEE_TAB_ICONS;

export function resolveSfSymbol(
  sf: TabSfIconConfig["sf"],
  isFocused: boolean
): SFSymbol {
  if (typeof sf === "string") return sf;
  return isFocused ? sf.selected : sf.default;
}

export function resolveAndroidIcon(
  android: TabSfIconConfig["android"],
  isFocused: boolean
): string {
  if (typeof android === "string") return android;
  return isFocused ? android.selected : android.default;
}
