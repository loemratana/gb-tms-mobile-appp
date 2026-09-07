import { Redirect } from "expo-router";

import { getDashboardPathForRole } from "@/features/auth/helpers/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Redirect href={getDashboardPathForRole(user.role)} />;
}
