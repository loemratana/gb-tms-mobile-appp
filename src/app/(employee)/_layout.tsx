import { Stack } from "expo-router";

import { NotificationSheetProvider } from "@/features/notifications/components/NotificationSheetProvider";
import { PerformanceAwardPopup } from "@/features/team/components/PerformanceAwardPopup";

export default function EmployeeLayout() {
  return (
    <NotificationSheetProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tasks/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="submit-work/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="task-comments/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="team/index"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="meetings/new"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="meetings/scan"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="meetings/check-in-code"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="meetings/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="team/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="submissions"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
      </Stack>
      <PerformanceAwardPopup />
    </NotificationSheetProvider>
  );
}
