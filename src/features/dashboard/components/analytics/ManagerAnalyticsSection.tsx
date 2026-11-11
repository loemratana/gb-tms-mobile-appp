import { Text, View } from "react-native";

import { ManagerAnalyticsSkeleton } from "./ManagerAnalyticsSkeleton";
import { StatusDonutChart } from "./StatusDonutChart";
import {
  toManagerAssignedEmployeeWorkloadData,
  toManagerAssignedStatusDonutData,
  toManagerAssignedWeeklyProductivityData,
} from "@/features/dashboard/utils/analytics";
import type { ManagerAssignedKpiResponse } from "@/features/tasks/types/task.types";
import { WorkloadBarChart } from "./WorkloadBarChart";
import { ProductivityChart } from "./ProductivityChart";

type ManagerAnalyticsSectionProps = {
  assignedKpi: ManagerAssignedKpiResponse | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function ManagerAnalyticsSection({
  assignedKpi,
  isLoading,
  isError,
}: ManagerAnalyticsSectionProps) {
  if (isLoading) {
    return <ManagerAnalyticsSkeleton />;
  }

  if (isError || !assignedKpi) {
    return (
      <Text className="py-4 text-center text-caption text-fg-faint">
        Couldn&apos;t load your assigned-task analytics.
      </Text>
    );
  }

  return (
    <View className="gap-4">
      <StatusDonutChart data={toManagerAssignedStatusDonutData(assignedKpi)} />
      <ProductivityChart data={toManagerAssignedWeeklyProductivityData(assignedKpi)} />
      {assignedKpi.memberWorkload.length > 0 && (
        <WorkloadBarChart data={toManagerAssignedEmployeeWorkloadData(assignedKpi)} />
      )}
    </View>
  );
}
