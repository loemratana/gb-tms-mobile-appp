import { Redirect, useLocalSearchParams } from "expo-router";

import { getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { useAuthStore } from "@/stores/authStore";

/**
 * Target of the alarm screen's "Open task" button (`tmsmobileapp://reminder?taskId=…`).
 * Group folders aren't part of URLs, so the alarm can't link straight to the
 * employee or manager task screen — this picks the right one for the signed-in role.
 */
export default function ReminderRedirect() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const role = useAuthStore((state) => state.user?.role);

  if (!role || !taskId) {
    return <Redirect href="/" />;
  }

  return <Redirect href={getTaskDetailPathForRole(role, taskId)} />;
}
