import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useState } from "react";
import { TextInput, type TextInputInstance, type TextInputProps } from "react-native";

import { APP_FONT_FAMILY } from "@/styles/typography";

export type UncontrolledTextInputProps = Omit<TextInputProps, "value" | "defaultValue"> & {
  /** The form's current value. Typing doesn't echo it back into the native field (see below). */
  value: string;
  /** Use inside a @gorhom bottom sheet so the sheet moves with the keyboard. */
  isInBottomSheet?: boolean;
};

/**
 * A text input that never writes each keystroke back into the native field.
 *
 * On the New Architecture, a controlled `value` that changes on every keystroke breaks keyboard
 * composition and drops Khmer vowels and subscripts (្). So the field is uncontrolled while the
 * user types, and only re-seeded when `value` changes from outside (a form reset, clearing a
 * sent comment): it then remounts with the new value, keeping focus if it had it.
 *
 * Every text input in the app should be this (or `TextField`, which is built on it).
 */
export const UncontrolledTextInput = forwardRef<TextInputInstance, UncontrolledTextInputProps>(
  function UncontrolledTextInput(
    { value, onChangeText, onFocus, onBlur, isInBottomSheet = false, autoFocus, ...props },
    ref,
  ) {
    // The text the native field is showing, as far as we know.
    const [shownValue, setShownValue] = useState(value);
    // What the field starts with; changes only when it's re-seeded. Passing the live `value` as
    // `defaultValue` instead would push every keystroke back into the native field (React Native
    // sends a changed defaultValue to native), which restarts the keyboard's input session on
    // Android — the keyboard closes while typing — and breaks Khmer composition again.
    const [seedValue, setSeedValue] = useState(value);
    const [remountKey, setRemountKey] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    // Adjusting state while rendering when a prop changes (react.dev "storing information from
    // previous renders"): an outside change re-seeds the field; typing never gets here because
    // handleChangeText records the typed text first.
    if (value !== shownValue) {
      setShownValue(value);
      setSeedValue(value);
      setRemountKey((key) => key + 1);
    }

    const handleChangeText = (text: string) => {
      setShownValue(text);
      onChangeText?.(text);
    };

    const inputProps = {
      ...props,
      // Inputs don't inherit a font, so every field sets the app font itself (a caller's style wins).
      style: [{ fontFamily: APP_FONT_FAMILY }, props.style],
      defaultValue: seedValue,
      onChangeText: handleChangeText,
      autoFocus: autoFocus || (remountKey > 0 && isFocused),
      onFocus: (event: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      onBlur: (event: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
        setIsFocused(false);
        onBlur?.(event);
      },
    };

    // The sheet input's ref has a different instance type; nothing focuses a sheet field
    // imperatively, so the ref is only forwarded for the regular input.
    return isInBottomSheet ? (
      <BottomSheetTextInput key={remountKey} {...inputProps} />
    ) : (
      <TextInput key={remountKey} ref={ref} {...inputProps} />
    );
  },
);
