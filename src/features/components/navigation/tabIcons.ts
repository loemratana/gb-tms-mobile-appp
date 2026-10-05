import {
  Calendar,
  CircleUserRound,
  ClipboardCheck,
  LayoutGrid,
  Users,
  type LucideIcon,
} from "lucide-react-native";

export type TabIconConfig = {
  label: string;
  icon: LucideIcon;
};

export const MANAGER_TAB_ICONS = {
  dashboard: { label: "Dashboard", icon: LayoutGrid },
  tasks: { label: "Tasks", icon: ClipboardCheck },
  team: { label: "Team", icon: Users },
  calendar: { label: "Calendar", icon: Calendar },
  profile: { label: "Profile", icon: CircleUserRound },
} as const satisfies Record<string, TabIconConfig>;

export type ManagerTabName = keyof typeof MANAGER_TAB_ICONS;

export const EMPLOYEE_TAB_ICONS = {
  dashboard: { label: "Dashboard", icon: LayoutGrid },
  "my-tasks": { label: "Tasks", icon: ClipboardCheck },
  team: { label: "Team", icon: Users },
  calendar: { label: "Calendar", icon: Calendar },
  profile: { label: "Profile", icon: CircleUserRound },
} as const satisfies Record<string, TabIconConfig>;

export type EmployeeTabName = keyof typeof EMPLOYEE_TAB_ICONS;
