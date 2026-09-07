import { View } from "react-native";

import { AnalyticsKpiStack } from "@/features/manager/components/analytics/AnalyticsKpiStack";
import type { ManagerKpi } from "@/features/manager/data/analytics";

type AnalyticsHeroCardProps = {
  kpis: ManagerKpi[];
};

export function AnalyticsHeroCard({ kpis }: AnalyticsHeroCardProps) {
  return (
    <View className="gap-4">
      <AnalyticsKpiStack kpis={kpis} />
    </View>
  );
}
