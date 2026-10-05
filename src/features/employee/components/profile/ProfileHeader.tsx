import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileHeaderProps = {
  onPressSettings?: () => void;
};

export function ProfileHeader({ onPressSettings }: ProfileHeaderProps) {
  return (
    <SafeAreaView edges={["top"]}>
      <View className="min-h-[56px] flex-row items-center justify-between px-5 py-2">
        <Text className="text-[17px] font-bold text-[#111827]">Profile</Text>

        <Pressable
          onPress={onPressSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]"
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
