import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TeamHeaderProps = {
  onPressSearch?: () => void;
  onPressFilter?: () => void;
};

export function TeamHeader({ onPressSearch, onPressFilter }: TeamHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center justify-between px-5 py-2">
        <Text className="text-[22px] font-bold tracking-tight text-[#111827]">
          Team
        </Text>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onPressSearch}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search team"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Ionicons name="search-outline" size={20} color="#111827" />
          </Pressable>

          <Pressable
            onPress={onPressFilter}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Filter team"
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Ionicons name="options-outline" size={20} color="#111827" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
