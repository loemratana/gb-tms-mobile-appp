import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CalendarHeaderProps = {
  onPressFilter?: () => void;
  activeFilterCount?: number;
};

export function CalendarHeader({
  onPressFilter,
  activeFilterCount = 0,
}: CalendarHeaderProps) {
  const hasFilters = activeFilterCount > 0;

  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center justify-between px-5 py-2">
        <Text className="text-[17px] font-bold text-[#111827]">Calendar</Text>

        <Pressable
          onPress={onPressFilter}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Filter calendar"
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: hasFilters ? "#ECFDF5" : "#F3F4F6",
          }}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={hasFilters ? "#32CD32" : "#111827"}
          />
          {hasFilters ? (
            <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-[#32CD32] px-1">
              <Text className="text-[9px] font-bold text-white">
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
