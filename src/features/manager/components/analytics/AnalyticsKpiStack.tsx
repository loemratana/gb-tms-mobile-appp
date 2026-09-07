import { StatsGrid } from "@/features/components/ui/StatsGrid";
import type { ManagerKpi } from "@/features/manager/data/analytics";

type AnalyticsKpiStackProps = {
  kpis: ManagerKpi[];
};

export function AnalyticsKpiStack({ kpis }: AnalyticsKpiStackProps) {
  return (
    <StatsGrid
      items={kpis.map((item) => ({
        title: item.title,
        value: item.value,
        label: item.label,
        icon: item.icon,
        variant: item.variant,
        softBackground: false,
      }))}
    />
  );
}
