import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type MonthSelectorProps = {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function MonthSelector({
  monthLabel,
  onPrevMonth,
  onNextMonth,
}: MonthSelectorProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Pressable
        onPress={onPrevMonth}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        className="h-9 w-9 items-center justify-center rounded-full bg-white"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Ionicons name="chevron-back" size={18} color="#111827" />
      </Pressable>

      <Text className="text-[16px] font-bold text-[#111827]">{monthLabel}</Text>

      <Pressable
        onPress={onNextMonth}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        className="h-9 w-9 items-center justify-center rounded-full bg-white"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Ionicons name="chevron-forward" size={18} color="#111827" />
      </Pressable>
    </View>
  );
}
