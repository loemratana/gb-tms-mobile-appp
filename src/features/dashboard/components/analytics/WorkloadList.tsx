import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { type EmployeeWorkloadDatum } from "@/features/dashboard/utils/analytics";

import { ChartSection } from "./ChartSection";

type WorkloadListProps = {
  data: EmployeeWorkloadDatum[];
  /** How many people have open tasks in total (the list shows the busiest few). */
  totalMembers: number;
};

/**
 * Who is carrying the most open work: each person with their photo, full name and a bar scaled to
 * the busiest one. (Replaces a bar chart that had to cut names down to "Sokha Ch…".)
 */
export function WorkloadList({ data, totalMembers }: WorkloadListProps) {
  const busiest = Math.max(...data.map((item) => item.tasks), 1);
  const subtitle =
    totalMembers > data.length ? `Open tasks · busiest ${data.length} of ${totalMembers}` : "Open tasks per person";

  return (
    <ChartSection title="Workload" subtitle={subtitle}>
      {data.map((item, index) => (
        <View
          key={item.id}
          className={`flex-row items-center gap-3 py-2.5 ${index > 0 ? "border-t border-line-soft" : ""}`}
          accessible
          accessibilityLabel={`${item.name}, ${item.tasks} open ${item.tasks === 1 ? "task" : "tasks"}`}
        >
          <Avatar name={item.name} imageUrl={item.avatarUrl} size={36} />
          <View className="min-w-0 flex-1">
            {/* No fixed line height: names may be Khmer. */}
            <Text className="text-body-sm font-medium text-fg" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
              <View
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max((item.tasks / busiest) * 100, 4)}%` }}
              />
            </View>
          </View>
          <Text className="w-8 text-right text-body font-bold text-fg">{item.tasks}</Text>
        </View>
      ))}
    </ChartSection>
  );
}
