import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { ComponentProps } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { colors } from "@/constants/theme";

const INPUT_STYLE = {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.inputBg,
  paddingHorizontal: 16,
  fontSize: 15,
  color: colors.text,
} as const;

type InputProps = TextInputProps & {
  multiline?: boolean;
};

export function Input({ style, multiline, ...props }: InputProps) {
  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={colors.textSubtle}
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        INPUT_STYLE,
        multiline ? { minHeight: 100, paddingVertical: 12 } : { height: 48 },
        style,
      ]}
    />
  );
}

type SheetInputProps = ComponentProps<typeof BottomSheetTextInput> & {
  multiline?: boolean;
};

export function SheetInput({ style, multiline, ...props }: SheetInputProps) {
  return (
    <BottomSheetTextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={colors.textSubtle}
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        INPUT_STYLE,
        multiline ? { minHeight: 100, paddingVertical: 12 } : { height: 48 },
        style,
      ]}
    />
  );
}
