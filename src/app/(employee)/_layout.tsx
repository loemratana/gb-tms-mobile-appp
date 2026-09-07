import { Stack } from "expo-router";

import { NotificationSheetProvider } from "@/features/employee/components/notifications/NotificationSheetProvider";

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
          name="team/[id]"
          options={{
            animation: "slide_from_right",
            presentation: "card",
          }}
        />
      </Stack>
    </NotificationSheetProvider>
  );
}
