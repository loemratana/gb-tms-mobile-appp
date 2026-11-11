import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, useState, type ComponentProps } from "react";
import { Pressable, Text, View, type TextInputInstance } from "react-native";

import { colors, fontSize } from "@/styles";

import { UncontrolledTextInput, type UncontrolledTextInputProps } from "./UncontrolledTextInput";

type TextFieldProps = Omit<UncontrolledTextInputProps, "style" | "className" | "secureTextEntry"> & {
  /** Shown above the field. Leave out when a surrounding form row already shows a label. */
  label?: string;
  /** Message under the field; also turns the border red. */
  error?: string;
  /** Red border without a message, for forms that show errors in their own row. */
  isInvalid?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Hides the text, with a show/hide toggle. */
  isPassword?: boolean;
};

/**
 * The app's text field: label, optional leading icon, password toggle, focus and error states,
 * single or multi-line. Khmer-safe (see `UncontrolledTextInput`).
 */
export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, error, isInvalid = false, icon, isPassword = false, multiline, editable = true, onFocus, onBlur, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasError = Boolean(error) || isInvalid;

  const borderClassName = hasError ? "border-error" : isFocused ? "border-brand" : "border-line";
  const iconColor = hasError ? colors.danger : isFocused ? colors.brand : colors.textSubtle;

  return (
    <View>
      {label ? <Text className="mb-2 text-caption font-semibold text-fg-sub">{label}</Text> : null}

      <View
        className={`flex-row rounded-xl border bg-surface px-3.5 ${borderClassName} ${
          multiline ? "min-h-[96px] items-start py-3" : "h-12 items-center"
        }`}
        style={{ opacity: editable ? 1 : 0.6 }}
      >
        {icon ? (
          <View className={multiline ? "mr-2.5 mt-0.5" : "mr-2.5"}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
        ) : null}

        <UncontrolledTextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          accessibilityLabel={props.accessibilityLabel ?? label}
          {...props}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          // No fixed lineHeight: Khmer stacks vowels and subscripts above and below the line.
          style={{
            flex: 1,
            alignSelf: "stretch",
            paddingVertical: 0,
            fontSize: fontSize.lg,
            color: colors.text,
          }}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setIsPasswordVisible((isVisible) => !isVisible)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            className="ml-2 h-8 w-8 items-center justify-center rounded-lg active:bg-subtle"
          >
            <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={19} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View className="mt-1.5 flex-row items-center gap-1.5 px-1">
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text className="flex-1 text-label font-medium text-error">{error}</Text>
        </View>
      ) : null}
    </View>
  );
});
