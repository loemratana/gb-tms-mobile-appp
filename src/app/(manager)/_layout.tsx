import { Stack } from "expo-router";

import { NotificationSheetProvider } from "@/features/employee/components/notifications/NotificationSheetProvider";
import { CreateTaskSheetProvider } from "@/features/manager/components/create-task/CreateTaskSheetProvider";

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
            name="projects/[id]"
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
      </CreateTaskSheetProvider>
    </NotificationSheetProvider>
  );
}
