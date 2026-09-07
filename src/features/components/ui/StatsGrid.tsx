import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import {
    StatCard,
    type StatCardProps,
    type StatCardVariant,
} from "@/features/components/ui/StatCard";

export type StatItem = {
  title: string;
  value: string | number;
  label?: string;
  icon: LucideIcon;
  variant?: StatCardVariant;
  softBackground?: boolean;
  onPress?: () => void;
};

type StatsGridProps = {
  title?: string;
  subtitle?: string;
  items: StatItem[];
};

/**
 * Professional 2-column stats layout for StatCard.
 * Pass 2 or 4 items for a balanced SaaS dashboard grid.
 */
export function StatsGrid({ title, subtitle, items }: StatsGridProps) {
  const rows: StatItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View className="gap-3">
      {title || subtitle ? (
        <View className="mb-1">
          {title ? (
            <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text className="mt-1 text-[22px] font-bold tracking-tight text-[#111827]">
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {rows.map((row, rowIndex) => (
        <View key={`stats-row-${rowIndex}`} className="flex-row gap-3">
          {row.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              label={item.label}
              icon={item.icon}
              variant={item.variant}
              softBackground={item.softBackground}
              onPress={item.onPress}
            />
          ))}
          {/* Keep row balanced when odd count */}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

export type { StatCardProps, StatCardVariant };
