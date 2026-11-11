import type { ReactNode } from "react";
import { Text, View } from "react-native";

export const sheetInputClassName =
  "h-12 rounded-xl border border-line bg-field px-4 text-body text-fg";

export const sheetTextAreaClassName =
  "min-h-[96px] rounded-xl border border-line bg-field px-4 py-3 text-body text-fg";

export const sheetTouchableClassName =
  "rounded-xl border border-line bg-field";

export function SheetField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-caption font-semibold text-fg-sub">{label}</Text>
      {children}
      {error ? (
        <Text className="mt-1 text-label text-error">{error}</Text>
      ) : null}
    </View>
  );
}

export function SheetSectionTitle({ title }: { title: string }) {
  return (
    <Text className="mt-6 mb-1 text-caption font-semibold text-fg-sub">{title}</Text>
  );
}
