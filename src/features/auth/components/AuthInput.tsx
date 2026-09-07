import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export function AuthInput({
  label,
  error,
  isPassword = false,
  ...props
}: AuthInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="text-[13px] font-medium text-[#374151]">{label}</Text>

      <View
        className={`flex-row items-center rounded-xl border bg-white px-4 ${
          error ? "border-[#EF4444]" : "border-[#E5E7EB]"
        }`}
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 1,
        }}
      >
        <TextInput
          {...props}
          secureTextEntry={isPassword && !visible}
          placeholderTextColor="#9CA3AF"
          className="h-12 flex-1 text-[15px] text-[#111827]"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="text-[12px] font-medium text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
