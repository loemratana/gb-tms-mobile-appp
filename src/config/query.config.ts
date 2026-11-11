import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform, type AppStateStatus } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// React Query's "refetch on window focus" only knows about browser focus. On
// native, tell it when the app returns to the foreground so stale data (e.g. a
// task an admin assigned while the app was in the background) is refetched.
if (Platform.OS !== "web") {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      handleFocus(status === "active");
    });
    return () => subscription.remove();
  });
}
