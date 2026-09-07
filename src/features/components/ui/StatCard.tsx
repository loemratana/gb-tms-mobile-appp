import type { LucideIcon } from "lucide-react-native";
import { Platform, Pressable, Text, View } from "react-native";

export type StatCardVariant =
  | "lavender"
  | "pink"
  | "mint"
  | "cream"
  | "blue"
  | "gray";

export type StatCardProps = {
  title: string;
  value: string | number;
  label?: string;
  icon: LucideIcon;
  variant?: StatCardVariant;
  compact?: boolean;
  softBackground?: boolean;
  onPress?: () => void;
};

const VARIANTS: Record<
  StatCardVariant,
  { accent: string; iconBg: string; bg: string; border: string }
> = {
  lavender: {
    accent: "#7C3AED",
    iconBg: "#EDE9FE",
    bg: "#F8F6FF", // soft lavender background
    border: "#E5E0FF",
  },
  pink: {
    accent: "#DB2777",
    iconBg: "#FCE7F3",
    bg: "#FFF5F8", // soft pink background
    border: "#FFD9E6",
  },
  mint: {
    accent: "#059669",
    iconBg: "#D1FAE5",
    bg: "#F2FCF9", // soft mint background
    border: "#C6F0E0",
  },
  cream: {
    accent: "#D97706",
    iconBg: "#FEF3C7",
    bg: "#FFFAF0", // soft cream background
    border: "#FDE68A",
  },
  blue: {
    accent: "#2563EB",
    iconBg: "#DBEAFE",
    bg: "#F0F7FF", // soft blue background
    border: "#BFDBFE",
  },
  gray: {
    accent: "#4B5563",
    iconBg: "#F3F4F6",
    bg: "#F9FAFB", // soft gray background
    border: "#E5E7EB",
  },
};

export function StatCard({
  title,
  value,
  label = "Tasks",
  icon: Icon,
  variant = "blue",
  compact = false,
  softBackground = true,
  onPress,
}: StatCardProps) {
  const theme = VARIANTS[variant];
  const iconBackground = softBackground ? theme.iconBg : theme.accent;
  const iconColor = softBackground ? theme.accent : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}: ${value} ${label}`}
      className="flex-1"
      style={({ pressed }) => [
        { transform: [{ scale: pressed && onPress ? 0.98 : 1 }] },
      ]}
    >
      <View
        className={`rounded-2xl border border-gray-200/60 ${compact ? "p-3" : "p-4"}`}
        style={{
          backgroundColor: softBackground ? theme.bg : "#FFFFFF",
          ...Platform.select({
            ios: {
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 15,
            },
            android: { elevation: 2 },
          }),
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className={`font-bold text-gray-500 ${compact ? "text-xs" : "text-sm"}`}
            numberOfLines={compact ? 2 : 1}
          >
            {title}
          </Text>
          <View
            className={`items-center justify-center rounded-xl ${
              compact ? "h-9 w-9" : "h-10 w-10"
            }`}
            style={{
              backgroundColor: iconBackground,
              borderWidth: softBackground ? 1 : 0,
              borderColor: theme.border,
            }}
          >
            <Icon size={compact ? 16 : 18} color={iconColor} strokeWidth={2} />
          </View>
        </View>

        <View
          className={`flex-row items-baseline ${compact ? "mt-2" : "mt-3"}`}
        >
          <Text
            className={`font-bold text-gray-900 ${compact ? "text-2xl" : "text-3xl"}`}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          <Text
            className={`ml-1.5 font-medium text-gray-400 ${
              compact ? "text-[11px]" : "text-sm"
            }`}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
