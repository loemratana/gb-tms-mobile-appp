import { formatRoleLabel } from "@/features/auth/helpers/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";

export function useHeaderUser() {
  const authUser = useAuthStore((s) => s.user);
  const profileUser = useProfileStore((s) => s.user);

  const userName = authUser?.name ?? profileUser.name;
  const role = authUser
    ? formatRoleLabel(authUser.role)
    : profileUser.role;
  const avatarUrl =
    profileUser.avatarUrl ||
    (authUser
      ? `https://i.pravatar.cc/100?u=${authUser.id}`
      : "https://i.pravatar.cc/100?u=guest");

  return { userName, role, avatarUrl };
}
