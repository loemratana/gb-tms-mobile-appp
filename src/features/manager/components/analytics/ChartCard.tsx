import type { ReactNode } from "react";
import { Platform, Text, View, type ViewProps } from "react-native";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 3 },
});

type ChartCardProps = ViewProps & {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  ...props
}: ChartCardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 ${className}`.trim()}
      style={CARD_SHADOW}
      {...props}
    >
      <Text className="text-[15px] font-semibold text-[#111827]">{title}</Text>
      {subtitle ? (
        <Text className="mt-0.5 text-[13px] text-[#6B7280]">{subtitle}</Text>
      ) : null}
      <View className="mt-4">{children}</View>
    </View>
  );
}
