import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  /** New for every toast, so showing the same text twice still replays the animation. */
  id: number;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastState = {
  current: Toast | null;
  show: (type: ToastType, title: string, message?: string) => void;
  /** Hides the toast, if it's still the one with this id (a newer one may have replaced it). */
  hide: (id: number) => void;
};

let nextId = 1;

/** One toast at a time: a new one replaces the current, which suits quick success / failure notes. */
export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (type, title, message) => set({ current: { id: nextId++, type, title, message } }),
  hide: (id) => set((state) => (state.current?.id === id ? { current: null } : state)),
}));

/**
 * Short, non-blocking feedback after an action — use instead of a plain `Alert.alert` message.
 * Keep `Alert.alert` for questions that need an answer (Delete? Discard? Sign out?).
 */
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().show("success", title, message),
  error: (title: string, message?: string) => useToastStore.getState().show("error", title, message),
  warning: (title: string, message?: string) => useToastStore.getState().show("warning", title, message),
  info: (title: string, message?: string) => useToastStore.getState().show("info", title, message),
};
