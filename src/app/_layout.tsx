import "@/config/sentry.config";
import "react-native-gesture-handler";
import "../../global.css";
import "@/lib/nativewind-interop";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/config/query.config";
import { TaskProvider } from "@/contexts/TaskContext";
import {
  consumeInitialNotification,
  startPushListeners,
} from "@/lib/pushNotifications";
import { useAuthStore } from "@/stores/authStore";

function AuthBootstrap({ children }: { children: ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const stopListening = startPushListeners();
    return stopListening;
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void consumeInitialNotification();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F3F4F6",
        }}
      >
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return children;
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <AuthBootstrap>
              {/* TaskProvider wraps the whole navigator, so any screen mounted
                  below — today just the manager project detail screen — can
                  call useTaskContext() and read/update the same task state. */}
              <TaskProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </TaskProvider>
            </AuthBootstrap>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
