import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function SectionLabel({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <View className={className}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1,
          textTransform: "uppercase",
          color: colors.textSubtle,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ marginTop: 2, fontSize: 13, color: colors.textMuted }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          marginBottom: 8,
          fontSize: 13,
          fontWeight: "600",
          color: colors.text,
        }}
      >
        {label}
      </Text>
      {children}
      {error ? (
        <Text style={{ marginTop: 4, fontSize: 12, color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
