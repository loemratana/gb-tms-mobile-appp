import type { Task } from "@/features/employee/types/types";

/**
 * Shared task state for the manager "project tasks" feature
 * (see src/contexts/TaskContext.tsx for how this is exposed to components).
 *
 * This is the ONE source of truth for this feature's tasks — screens and
 * components read it via useTaskContext() instead of holding their own copy.
 */
export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

export const initialTaskState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Every state transition this feature supports, as a discriminated union.
// This is what lets TypeScript narrow `action.payload` per `action.type`
// inside the reducer below.
export type TaskAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOAD_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; changes: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "COMPLETE_TASK"; payload: string };

/**
 * Pure state-transition logic:
 *
 *   current state -> dispatch(action) -> taskReducer() -> new state -> React re-renders
 *
 * No API calls, no side effects, nothing time-dependent (e.g. Date.now()) —
 * reducers must be predictable so React can safely re-invoke them (e.g.
 * under StrictMode) without changing behavior. Async work and API calls
 * live in the service layer + the action functions in TaskContext instead.
 */
export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "LOAD_TASKS":
      return { ...state, tasks: action.payload, loading: false, error: null };

    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.changes } : task,
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        // Deleting a parent also drops its subtasks — there's no orphaned-subtask UI.
        tasks: state.tasks.filter(
          (task) => task.id !== action.payload && task.parentId !== action.payload,
        ),
      };

    case "COMPLETE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload ? { ...task, status: "done", progress: 100 } : task,
        ),
      };

    default:
      return state;
  }
}
