import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { TabHeader } from "@/components/layout/TabHeader";
import { TeamPreview } from "@/features/team/components/TeamPreview";
import {
  ManagerAnalyticsBottomSheet,
  type ManagerAnalyticsBottomSheetRef,
} from "@/features/dashboard/components/analytics/ManagerAnalyticsBottomSheet";
import { DashboardShortcuts } from "@/features/dashboard/components/DashboardShortcuts";
import { ManagerDashboardSkeleton } from "@/features/dashboard/components/ManagerDashboardSkeleton";
import { TaskStatisticsCard } from "@/features/dashboard/components/TaskStatisticsCard";
import { TaskStatusStats } from "@/features/tasks/components/shared/TaskStatusStats";
import { TopPerformersModal } from "@/features/dashboard/components/TopPerformersModal";
import { useTasksPerMonth } from "@/features/dashboard/hooks/useTasksPerMonth";
import {
  toTopPerformers,
  type TopPerformer,
} from "@/features/dashboard/utils/topPerformers";
import { useManagerAssignedKpi, useTaskCounts } from "@/features/tasks/hooks/useTasks";
import { toTaskStatusCounts } from "@/features/tasks/utils/taskStatusCounts";
import type { StatusFilter } from "@/features/tasks/types/taskView.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const [topPerformersOpen, setTopPerformersOpen] = useState(false);
  const analyticsSheetRef = useRef<ManagerAnalyticsBottomSheetRef>(null);

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const assignedById = currentUser?.id;

  // Same query ManagerAnalyticsSection runs — shares the React Query cache entry.
  // Only feeds the top performers modal, so it doesn't gate the dashboard.
  const { data: assignedKpi } = useManagerAssignedKpi();
  const topPerformers = useMemo(
    () => toTopPerformers(assignedKpi?.topPerformers ?? []),
    [assignedKpi],
  );

  // Monthly chart is counted on the server — a fetched page would cap it at 200 rows.
  const tasksPerMonth = useTasksPerMonth({ assignedById }, Boolean(assignedById));
  const {
    isLoading: isLoadingTasks,
    isError: isTasksError,
    refetch: refetchTasks,
  } = tasksPerMonth;
  // Overview numbers come from the server: counting the fetched page would stop at its 200-row cap.
  const {
    data: taskCounts,
    isLoading: isLoadingCounts,
    isError: isCountsError,
    refetch: refetchCounts,
  } = useTaskCounts({ assignedById, topLevelOnly: true }, Boolean(assignedById));
  const refetchDashboard = useCallback(() => {
    refetchTasks();
    void refetchCounts();
  }, [refetchTasks, refetchCounts]);
  useRefetchOnFocus(refetchDashboard);
  const statusCounts = useMemo(() => toTaskStatusCounts(taskCounts), [taskCounts]);

  const openMemberDetails = (performer: TopPerformer) => {
    setTopPerformersOpen(false);
    router.push({
      pathname: "/(manager)/team/[id]",
      params: { id: performer.id },
    });
  };

  const openTeamMember = (member: { id: string }) => {
    router.push({
      pathname: "/(manager)/team/[id]",
      params: { id: member.id },
    });
  };

  const openTeamScreen = () => {
    router.push("/(manager)/team");
  };

  // Each card opens Tasks on the tab that lists exactly the tasks it counted.
  const openTasksScreen = (status: StatusFilter) => {
    router.push({ pathname: "/(manager)/(tabs)/tasks", params: { status } });
  };

  const isLoadingDashboard = isLoadingUser || isLoadingTasks || isLoadingCounts;

  return (
    <>
      <Screen
        header={
          <TabHeader
            variant="profile"
            onAnalyzePress={() => analyticsSheetRef.current?.present()}
          />
        }
      >
        {isLoadingDashboard ? (
          <ManagerDashboardSkeleton />
        ) : (
          <View className="gap-6">
            {isTasksError || isCountsError ? (
              <StateView
                variant="error"
                title="Couldn't load your tasks"
                message="Check your connection and try again."
                actionLabel="Try again"
                onPressAction={refetchDashboard}
                isCompact
              />
            ) : (
              <View>
                <SectionHeader title="Overview" />
                <TaskStatusStats counts={statusCounts} onPressStatus={openTasksScreen} />
              </View>
            )}
            <DashboardShortcuts
              canReview
              onOpenReviewQueue={() => router.push("/(manager)/reviews")}
              onOpenMySubmissions={() => router.push("/(manager)/submissions")}
              onOpenTeam={openTeamScreen}
              teamSubtitle="Your direct reports and department"
            />
            {isTasksError ? null : (
              <TaskStatisticsCard
                year={tasksPerMonth.year}
                months={tasksPerMonth.months}
                currentMonth={tasksPerMonth.currentMonth}
                isCurrentYear={tasksPerMonth.isCurrentYear}
                onPreviousYear={tasksPerMonth.goToPreviousYear}
                onNextYear={tasksPerMonth.goToNextYear}
                onCurrentYear={tasksPerMonth.goToCurrentYear}
              />
            )}
            <TeamPreview
              onSeeAll={openTeamScreen}
              onMemberPress={openTeamMember}
            />
          </View>
        )}
      </Screen>

      <ManagerAnalyticsBottomSheet
        ref={analyticsSheetRef}
        onSeeAllPerformers={() => setTopPerformersOpen(true)}
      />

      <TopPerformersModal
        visible={topPerformersOpen}
        performers={topPerformers}
        onClose={() => setTopPerformersOpen(false)}
        onViewDetails={openMemberDetails}
      />
    </>
  );
}
