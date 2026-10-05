import { useContext } from "react";

import { TaskContext, type TaskContextValue } from "@/contexts/TaskContext";

/**
 * useContext(TaskContext) is the read side of the Context/Provider pair —
 * this hook just wraps that call so components never touch TaskContext
 * directly and get a clear error if they render outside <TaskProvider>.
 *
 * Named useTaskContext (not useTask/useTasks) because those names are
 * already taken by the TanStack Query hooks in
 * src/features/tasks/hooks/useTasks.ts, which manage the real
 * backend-integrated task list — a separate feature from this one. See the
 * project README for how the two relate.
 */
export function useTaskContext(): {
  tasks: TaskContextValue["state"]["tasks"];
  loading: boolean;
  error: string | null;
  addTask: TaskContextValue["addTask"];
  updateTask: TaskContextValue["updateTask"];
  deleteTask: TaskContextValue["deleteTask"];
  completeTask: TaskContextValue["completeTask"];
  clearError: TaskContextValue["clearError"];
  refresh: TaskContextValue["refresh"];
  dispatch: TaskContextValue["dispatch"];
} {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used inside a TaskProvider");
  }

  const { state, ...actions } = context;

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    ...actions,
  };
}
