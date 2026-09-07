import type { ReactNode } from "react";
import { Text, View } from "react-native";

export const sheetInputClassName =
  "h-12 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[15px] text-[#111827]";

export const sheetTextAreaClassName =
  "min-h-[96px] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827]";

export const sheetTouchableClassName =
  "rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]";

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
      <Text className="mb-2 text-[13px] font-semibold text-[#374151]">{label}</Text>
      {children}
      {error ? (
        <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}

export function SheetSectionTitle({ title }: { title: string }) {
  return (
    <Text className="mt-6 mb-1 text-[13px] font-semibold text-[#374151]">{title}</Text>
  );
}
