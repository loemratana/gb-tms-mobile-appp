import { createContext, useCallback, useEffect, useReducer, type ReactNode } from "react";

import {
  completeProjectTask,
  createProjectTask,
  deleteProjectTask,
  fetchProjectTasks,
  updateProjectTask,
  type CreateProjectTaskInput,
} from "@/services/projectTasks.service";
import { initialTaskState, taskReducer, type TaskAction, type TaskState } from "@/reducers/taskReducer";
import type { Task } from "@/features/employee/types/types";

// createContext() creates the shared "channel" components can read from —
// on its own it holds no state, it just gives useContext() something to
// find. `undefined` is the default so useTaskContext() (see
// src/hooks/useTaskContext.ts) can detect a component rendered outside the
// Provider and fail loudly instead of silently reading nothing.
export type TaskContextValue = {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (input: CreateProjectTaskInput) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
};

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);

type TaskProviderProps = {
  children: ReactNode;
};

/**
 * Provides task state to every screen mounted below it. Owns the ONLY
 * useReducer() call for this feature — components never call the reducer
 * directly, they call the action functions below (or useTaskContext(), see
 * src/hooks/useTaskContext.ts).
 *
 * Local vs. shared state: this Provider only ever holds the shared task
 * list/loading/error state. UI-only state (a search box's text, whether a
 * bottom sheet is open, ...) stays as useState inside the component that
 * owns it — it never belongs here.
 */
export function TaskProvider({ children }: TaskProviderProps) {
  // useReducer manages *how* state changes; TaskProvider is just the one
  // place that owns that state and hands it out via Context.
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  const refresh = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const tasks = await fetchProjectTasks();
      dispatch({ type: "LOAD_TASKS", payload: tasks });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load tasks" });
    }
  }, []);

  // Load once when the Provider first mounts — screens don't each fetch
  // their own copy, they just read whatever is already in Context.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addTask = useCallback(async (input: CreateProjectTaskInput) => {
    try {
      const task = await createProjectTask(input);
      dispatch({ type: "ADD_TASK", payload: task });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to create task" });
    }
  }, []);

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    try {
      const applied = await updateProjectTask(id, changes);
      dispatch({ type: "UPDATE_TASK", payload: { id, changes: applied } });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to update task" });
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteProjectTask(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete task" });
    }
  }, []);

  const completeTask = useCallback(async (id: string) => {
    try {
      await completeProjectTask(id);
      dispatch({ type: "COMPLETE_TASK", payload: id });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to complete task" });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <TaskContext.Provider
      value={{ state, dispatch, addTask, updateTask, deleteTask, completeTask, clearError, refresh }}
    >
      {children}
    </TaskContext.Provider>
  );
}
