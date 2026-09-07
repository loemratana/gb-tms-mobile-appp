import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Text, TextInput, View } from "react-native";

const inputStyle = {
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "#F9FAFB",
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: "#111827",
} as const;

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  editable?: boolean;
  bottomSheet?: boolean;
};

export function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  editable = true,
  bottomSheet = false,
}: FormFieldProps) {
  const sharedProps = {
    value,
    onChangeText,
    onBlur,
    placeholder,
    placeholderTextColor: "#9CA3AF",
    keyboardType,
    autoCapitalize,
    editable,
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-[#374151]">
        {label}
      </Text>
      {bottomSheet ? (
        <BottomSheetTextInput {...sharedProps} style={inputStyle} />
      ) : (
        <TextInput
          {...sharedProps}
          className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 text-[15px] text-[#111827]"
        />
      )}
      {error ? (
        <Text className="mt-1.5 text-[12px] text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
