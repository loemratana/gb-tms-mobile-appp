import { View } from "react-native";

import { StatCard, type StatCardProps } from "@/components/ui/StatCard";

type StatsGridProps = {
  /** 2 or 4 items read best; an odd item is padded so rows stay balanced. */
  items: StatCardProps[];
};

/** Two-column grid of {@link StatCard}s. */
export function StatsGrid({ items }: StatsGridProps) {
  const rows: StatCardProps[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return (
    <View className="gap-3">
      {rows.map((row, rowIndex) => (
        <View key={`stats-row-${rowIndex}`} className="flex-row gap-3">
          {row.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
