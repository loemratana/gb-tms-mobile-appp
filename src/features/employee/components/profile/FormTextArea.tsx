import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Text, TextInput, View } from "react-native";

const textAreaStyle = {
  minHeight: 110,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "#F9FAFB",
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: "#111827",
  textAlignVertical: "top" as const,
};

type FormTextAreaProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  bottomSheet?: boolean;
};

export function FormTextArea({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  maxLength = 200,
  bottomSheet = false,
}: FormTextAreaProps) {
  const sharedProps = {
    value,
    onChangeText,
    onBlur,
    placeholder,
    placeholderTextColor: "#9CA3AF",
    multiline: true,
    maxLength,
  };

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-[#374151]">{label}</Text>
        <Text className="text-[11px] text-[#9CA3AF]">
          {value.length}/{maxLength}
        </Text>
      </View>
      {bottomSheet ? (
        <BottomSheetTextInput {...sharedProps} style={textAreaStyle} />
      ) : (
        <TextInput
          {...sharedProps}
          textAlignVertical="top"
          className="min-h-[110px] rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 text-[15px] text-[#111827]"
        />
      )}
      {error ? (
        <Text className="mt-1.5 text-[12px] text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
