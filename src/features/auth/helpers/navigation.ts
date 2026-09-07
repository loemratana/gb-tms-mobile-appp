import type { Href } from "expo-router";

import type { UserRole } from "@/features/auth/types/auth";

export function getDashboardPathForRole(role: UserRole): Href {
  switch (role) {
    case "ADMIN":
      return "/(admin)/dashboard";
    case "MANAGER":
      return "/(manager)/(tabs)/dashboard";
    case "EMPLOYEE":
      return "/(employee)/(tabs)/dashboard";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function formatRoleLabel(role: UserRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
