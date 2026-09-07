import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef } from "react";
import { Pressable, TextInput, View } from "react-native";

type TaskSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
};

export const TaskSearchBar = forwardRef<TextInput, TaskSearchBarProps>(
  function TaskSearchBar({ value, onChangeText, onClear }, ref) {
    return (
      <View className="flex-row items-center rounded-2xl bg-[#F3F4F6] px-3.5 py-2.5">
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search tasks..."
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          className="ml-2 flex-1 py-0 text-[15px] text-[#111827]"
          accessibilityLabel="Search tasks"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="ml-1 h-6 w-6 items-center justify-center rounded-full bg-[#E5E7EB]"
          >
            <Ionicons name="close" size={14} color="#6B7280" />
          </Pressable>
        ) : null}
      </View>
    );
  }
);
