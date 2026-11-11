import { formatRoleLabel } from "./navigation";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { useProfileStore } from "@/stores/profileStore";

export function syncProfileFromAuthUser(user: AuthUser, email?: string) {
  useProfileStore.getState().setUser({
    name: user.name,
    role: formatRoleLabel(user.role),
    department: "",
    avatarUrl: user.avatarUrl ?? null,
    email: email ?? user.email ?? "",
  });
}
