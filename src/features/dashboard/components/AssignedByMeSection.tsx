import { View } from "react-native";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ManagerAnalyticsSection } from "@/features/dashboard/components/analytics/ManagerAnalyticsSection";
import { ManagerAnalyticsSkeleton } from "@/features/dashboard/components/analytics/ManagerAnalyticsSkeleton";
import { useManagerAssignedKpi } from "@/features/tasks/hooks/useTasks";

/**
 * Home-screen dashboard of the tasks the current user has assigned to others:
 * headline counts plus status, weekly-completion and workload charts.
 * Backed by `GET /tasks/me/assigned-kpi` (scoped to tasks where assignedBy = me).
 */
export function AssignedByMeSection() {
  const { data: assignedKpi, isLoading, isError, refetch } = useManagerAssignedKpi();

  if (isLoading) {
    return (
      <View>
        <SectionHeader title="Assigned by me" />
        <ManagerAnalyticsSkeleton />
      </View>
    );
  }

  if (isError || !assignedKpi) {
    return (
      <View>
        <SectionHeader title="Assigned by me" />
        <StateView
          variant="error"
          title="Couldn't load your assigned tasks"
          message="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={() => void refetch()}
          isCompact
        />
      </View>
    );
  }

  const completionRate =
    assignedKpi.totalTasks > 0
      ? Math.round((assignedKpi.doneTasks / assignedKpi.totalTasks) * 100)
      : 0;

  return (
    <View>
      <SectionHeader
        title="Assigned by me"
        meta={`${assignedKpi.totalTasks} tasks · ${completionRate}% done`}
      />
      <View className="gap-4">
        <StatsGrid
          items={[
            { title: "Assigned", value: assignedKpi.totalTasks, icon: "send", tone: "neutral" },
            { title: "In progress", value: assignedKpi.pendingTasks, icon: "trending-up", tone: "info" },
            { title: "To review", value: assignedKpi.reviewTasks, icon: "eye-outline", tone: "warning" },
            { title: "Completed", value: assignedKpi.doneTasks, icon: "checkmark-circle-outline", tone: "success" },
            { title: "Overdue", value: assignedKpi.overdueTasks, icon: "warning-outline", tone: "error" },
            { title: "Rejected", value: assignedKpi.rejectedTasks, icon: "arrow-undo-outline", tone: "violet" },
          ]}
        />
        {assignedKpi.totalTasks > 0 ? (
          <ManagerAnalyticsSection assignedKpi={assignedKpi} isLoading={false} isError={false} />
        ) : null}
      </View>
    </View>
  );
}
