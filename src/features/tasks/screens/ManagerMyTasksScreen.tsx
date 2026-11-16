import { useRouter } from "expo-router";
import { useCallback } from "react";

import type { Task } from "@/features/tasks/types/taskView.types";

import TasksScreen from "./MyTasksScreen";

/**
 * Tasks assigned to the manager themself. Their Tasks tab lists what they handed out, so this is
 * reached from the dashboard's "My work" section instead. Same list as an employee's My Tasks.
 */
export default function ManagerMyTasksScreen() {
  const router = useRouter();

  const handleTaskPress = useCallback(
    (task: Task) => router.push({ pathname: "/(manager)/tasks/[id]", params: { id: task.id } }),
    [router],
  );

  return <TasksScreen onTaskPress={handleTaskPress} />;
}
