import * as Haptics from "expo-haptics";
import { View } from "react-native";

import { FloatingActionButton } from "@/features/components/navigation/FloatingActionButton";
import { FAB_SIZE } from "@/features/components/navigation/constants";
import { useTabBarInset } from "@/features/components/navigation/ModernTabBar";
import { useCreateTaskSheet } from "@/features/manager/components/create-task/CreateTaskSheetProvider";

const FAB_GAP = 12;

export function ManagerCreateTaskFab() {
  const tabBarInset = useTabBarInset();
  const { open: openCreateTask } = useCreateTaskSheet();

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openCreateTask();
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-end px-5"
      style={{
        bottom: tabBarInset + FAB_GAP,
        zIndex: 50,
      }}
    >
      <FloatingActionButton size={FAB_SIZE} onPress={handlePress} onLongPress={handlePress} />
    </View>
  );
}
