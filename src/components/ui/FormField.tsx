import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "@/styles";

type FormFieldProps = {
  label: string;
  /** Fields are required by default; optional ones say so in the label. */
  isOptional?: boolean;
  /** Shown on the right of the label, e.g. "+ Add" or a character count. */
  action?: ReactNode;
  /** Help under the field; replaced by `error` when there is one. */
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label, input and error message — the one form row used by every form in the app. */
export function FormField({ label, isOptional = false, action, hint, error, children }: FormFieldProps) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Text className="text-caption font-semibold text-fg-sub">
          {label}
          {isOptional ? <Text className="font-normal text-fg-faint"> (optional)</Text> : null}
        </Text>
        {action}
      </View>
      {children}
      {error ? (
        <View className="mt-1.5 flex-row items-center gap-1.5 px-1">
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text className="flex-1 text-label font-medium text-error">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="mt-1.5 px-1 text-label leading-[17px] text-fg-faint">{hint}</Text>
      ) : null}
    </View>
  );
}

/** Heading that groups related fields, e.g. "What" / "Who" / "When". */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="text-micro font-bold uppercase tracking-wider text-fg-faint">{title}</Text>
      {children}
    </View>
  );
}
