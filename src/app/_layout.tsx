import "@/config/sentry.config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";
import "@/lib/nativewind-interop";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastHost } from "@/components/ui/ToastHost";
import { APP_FONTS } from "@/config/fonts";
import { queryClient } from "@/config/query.config";
import { useRouteGuards } from "@/features/auth/hooks/useRouteGuards";
import {
  consumeInitialNotification,
  startPushListeners,
} from "@/lib/pushNotifications";
import { useAuthStore } from "@/stores/authStore";
import { colors, themeVars } from "@/styles";

function AuthBootstrap({ children }: { children: ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  // The app font. If it fails to load, carry on with the system font rather than blocking the app.
  const [areFontsLoaded, fontError] = useFonts(APP_FONTS);
  const isFontReady = areFontsLoaded || Boolean(fontError);

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

  if (!isHydrated || !isFontReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.mutedBg,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return children;
}

/**
 * Route groups are gated here, so deep links and notification taps can't open
 * a screen the session isn't allowed to see. When a guard flips (sign-in,
 * sign-out, 401), Expo Router redirects to `index`, which picks the right home.
 */
function GuardedStack() {
  const { isSignedIn, canAccessEmployeeArea, canAccessManagerArea } = useRouteGuards();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={canAccessEmployeeArea}>
        <Stack.Screen name="(employee)" />
      </Stack.Protected>
      <Stack.Protected guard={canAccessManagerArea}>
        <Stack.Screen name="(manager)" />
      </Stack.Protected>
    </Stack>
  );
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* Colour-class variables for the light/dark token set; wraps the sheet provider so
              bottom sheets (rendered in its portal) resolve them too. */}
          <View className="flex-1" style={themeVars}>
            <StatusBar style="auto" />
            <BottomSheetModalProvider>
              <AuthBootstrap>
                <GuardedStack />
              </AuthBootstrap>
            </BottomSheetModalProvider>
            {/* After the sheets, so success / error toasts draw on top of them. */}
            <ToastHost />
          </View>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
