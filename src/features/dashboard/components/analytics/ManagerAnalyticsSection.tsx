import { Fragment, type ReactNode } from "react";
import { View } from "react-native";

import { StateView } from "@/components/ui/StateView";
import {
  toManagerAssignedEmployeeWorkloadData,
  toManagerAssignedStatusDonutData,
  toManagerAssignedWeeklyProductivityData,
} from "@/features/dashboard/utils/analytics";
import type { ManagerAssignedKpiResponse } from "@/features/tasks/types/task.types";

import { ManagerAnalyticsSkeleton } from "./ManagerAnalyticsSkeleton";
import { ProductivityChart } from "./ProductivityChart";
import { StatusBreakdown } from "./StatusBreakdown";
import { WorkloadList } from "./WorkloadList";

type ManagerAnalyticsSectionProps = {
  assignedKpi: ManagerAssignedKpiResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
};

/** The charts for tasks the user assigned, as one report: sections split by thin dividers. */
export function ManagerAnalyticsSection({ assignedKpi, isLoading, isError, onRetry }: ManagerAnalyticsSectionProps) {
  if (isLoading) {
    return <ManagerAnalyticsSkeleton />;
  }

  if (isError || !assignedKpi) {
    return (
      <StateView
        variant="error"
        title="Couldn't load analytics"
        message="Check your connection and try again."
        actionLabel={onRetry ? "Try again" : undefined}
        onPressAction={onRetry}
        isCompact
      />
    );
  }

  if (assignedKpi.totalTasks === 0) {
    return (
      <StateView
        variant="empty"
        icon="bar-chart-outline"
        title="No assigned tasks yet"
        message="Tasks you assign to your team will show up here."
        isCompact
      />
    );
  }

  const sections: ReactNode[] = [
    <StatusBreakdown key="status" data={toManagerAssignedStatusDonutData(assignedKpi)} />,
    <ProductivityChart key="productivity" data={toManagerAssignedWeeklyProductivityData(assignedKpi)} />,
  ];
  if (assignedKpi.memberWorkload.length > 0) {
    sections.push(
      <WorkloadList
        key="workload"
        data={toManagerAssignedEmployeeWorkloadData(assignedKpi)}
        totalMembers={assignedKpi.memberWorkload.length}
      />,
    );
  }

  return (
    <View>
      {sections.map((section, index) => (
        <Fragment key={index}>
          {index > 0 ? <View className="my-6 h-px bg-line-soft" /> : null}
          {section}
        </Fragment>
      ))}
    </View>
  );
}
