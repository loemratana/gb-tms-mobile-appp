import { canAccessManagerArea } from "@/features/auth/utils/navigation";
import { useAuthStore } from "@/stores/authStore";

type RouteGuards = {
  isSignedIn: boolean;
  canAccessEmployeeArea: boolean;
  canAccessManagerArea: boolean;
};

/** Single source of truth for which route groups the current session may open. */
export function useRouteGuards(): RouteGuards {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const isSignedIn = Boolean(token && user);
  const isManager = isSignedIn && user !== null && canAccessManagerArea(user.role);

  return {
    isSignedIn,
    canAccessEmployeeArea: isSignedIn && !isManager,
    canAccessManagerArea: isManager,
  };
}
