import { Stack } from "expo-router";

import { NotificationSheetProvider } from "@/features/notifications/components/NotificationSheetProvider";
import { CreateTaskSheetProvider } from "@/features/tasks/components/create/CreateTaskSheetProvider";

export default function ManagerLayout() {
  return (
    <NotificationSheetProvider>
      <CreateTaskSheetProvider>
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
            name="team/index"
            options={{
              animation: "slide_from_right",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="rooms/index"
            options={{
              animation: "slide_from_right",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="rooms/[id]"
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
            name="reviews"
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
      </CreateTaskSheetProvider>
    </NotificationSheetProvider>
  );
}
