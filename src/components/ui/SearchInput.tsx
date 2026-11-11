import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef } from "react";
import { Pressable, View } from "react-native";
import type { TextInputInstance } from "react-native";

import { colors } from "@/styles";

import { UncontrolledTextInput } from "./UncontrolledTextInput";

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
};

/** Search field with a clear button. The only search input in the app; Khmer-safe (see `UncontrolledTextInput`). */
export const SearchInput = forwardRef<TextInputInstance, SearchInputProps>(function SearchInput(
  { value, onChangeText, placeholder = "Search", accessibilityLabel = "Search" },
  ref,
) {
  return (
    <View className="h-11 flex-row items-center rounded-xl bg-subtle px-3.5">
      <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
      <UncontrolledTextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.brand}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        className="ml-2 h-full flex-1 py-0 text-body text-fg"
        accessibilityLabel={accessibilityLabel}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="ml-1 h-5 w-5 items-center justify-center rounded-full bg-line-strong"
        >
          <Ionicons name="close" size={12} color={colors.textInverse} />
        </Pressable>
      ) : null}
    </View>
  );
});
