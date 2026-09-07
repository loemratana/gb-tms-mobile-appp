import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import {
  isSubtask,
  resolveTaskSubtasks,
} from "@/features/employee/helpers/helpers";
import TasksScreen from "@/features/employee/screen/MyTasksScreen";
import type { Task } from "@/features/employee/types/types";
import { ManagerCreateTaskFab } from "@/features/manager/components/navigation/ManagerCreateTaskFab";
import { ManagerTaskCard } from "@/features/manager/components/task/ManagerTaskCard";
import { ManagerTaskStatsBar } from "@/features/manager/components/task/ManagerTaskStatsBar";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

export default function ManagerTasksScreen() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const assignedById = currentUser?.id;

  // Same query TasksScreen runs internally for its list — sharing the exact
  // params keeps this on the same React Query cache entry (no extra fetch),
  // and gives us the full set of tasks this manager assigned to resolve
  // subtasks from.
  const { data: tasksPage } = useTasks(
    { assignedById, size: 200 },
    Boolean(assignedById),
  );
  const tasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  // TasksScreen's own list filters subtasks out (they render nested inside
  // their parent's card instead), so the stats bar must match that same
  // top-level-only count — otherwise "Total Tasks" won't match what's
  // actually countable in the list below it.
  const topLevelTasks = useMemo(
    () => tasks.filter((task) => !isSubtask(task)),
    [tasks],
  );

  const subtasksByParentId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveTaskSubtasks>>();

    for (const task of topLevelTasks) {
      map.set(task.id, resolveTaskSubtasks(tasks, task));
    }

    return map;
  }, [tasks, topLevelTasks]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push({
        pathname: "/(manager)/tasks/[id]",
        params: { id: task.id },
      });
    },
    [router],
  );

  const renderTaskCard = useCallback(
    (task: Task) => (
      <ManagerTaskCard
        task={task}
        subtasks={subtasksByParentId.get(task.id) ?? []}
        onPress={handleTaskPress}
      />
    ),
    [handleTaskPress, subtasksByParentId],
  );

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <TasksScreen
        onTaskPress={handleTaskPress}
        renderTaskCard={renderTaskCard}
        searchParams={{ assignedById, size: 200 }}
        statsBar={<ManagerTaskStatsBar tasks={topLevelTasks} />}
      />
      <ManagerCreateTaskFab />
    </View>
  );
}
