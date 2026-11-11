import type { ReactNode } from "react";
import { Text, View } from "react-native";

type FormFieldProps = {
  label: string;
  error?: string;
  /** Shown on the right of the label, e.g. "+ Add". */
  action?: ReactNode;
  children: ReactNode;
};

/** Label, input and error message, spaced like the rest of the meeting form. */
export function FormField({ label, error, action, children }: FormFieldProps) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between px-1">
        <Text className="text-caption font-medium text-fg-soft">{label}</Text>
        {action}
      </View>
      {children}
      {error ? <Text className="mt-1 px-1 text-label text-error">{error}</Text> : null}
    </View>
  );
}
