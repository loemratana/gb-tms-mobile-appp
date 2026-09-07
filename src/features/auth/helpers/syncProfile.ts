import { formatRoleLabel } from "@/features/auth/helpers/navigation";
import type { AuthUser } from "@/features/auth/types/auth";
import { useProfileStore } from "@/stores/profileStore";

export function syncProfileFromAuthUser(user: AuthUser, email?: string) {
  useProfileStore.getState().setUser({
    name: user.name,
    role: formatRoleLabel(user.role),
    department: "",
    avatarUrl: user.avatarUrl ?? `https://i.pravatar.cc/200?u=${user.id}`,
    email: email ?? user.email ?? "",
  });
}
